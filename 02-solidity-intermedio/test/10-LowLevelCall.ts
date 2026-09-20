import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { toFunctionSelector, zeroAddress } from "viem";

describe("10 - Llamadas de bajo nivel", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, alice] = await viem.getWalletClients();

  async function desplegar() {
    const objetivo = await viem.deployContract("ObjetivoBajoNivel");
    const llamador = await viem.deployContract("LlamadorBajoNivel");
    return { objetivo, llamador };
  }

  it("call con firma en texto ejecuta la funcion del destino", async function () {
    const { objetivo, llamador } = await desplegar();

    await llamador.write.llamarConFirma([objetivo.address, 7n]);

    assert.equal(await objetivo.read.numero(), 7n);
  });

  it("call puede reenviar ETH junto con la llamada", async function () {
    const { objetivo, llamador } = await desplegar();

    await llamador.write.llamarConEncodeCall([objetivo.address, 9n], { value: 100n });

    assert.equal(await objetivo.read.numero(), 9n);
    assert.equal(await objetivo.read.recibido(), 100n);
    assert.equal(await publicClient.getBalance({ address: objetivo.address }), 100n);
  });

  it("call no revierte si el destino falla: devuelve false", async function () {
    const { objetivo, llamador } = await desplegar();

    const inexistente = await llamador.simulate.llamarInexistente([objetivo.address]);
    assert.equal(inexistente.result[0], false);

    const conRevert = await llamador.simulate.llamarQueFalla([objetivo.address]);
    assert.equal(conRevert.result[0], false);
    // Los datos traen el error codificado: Error(string) empieza con 0x08c379a0.
    assert.ok(conRevert.result[1].startsWith("0x08c379a0"));
  });

  it("si revisamos el booleano, podemos propagar el fallo", async function () {
    const { llamador } = await desplegar();

    // `llamador` no tiene establecer(uint256): la llamada falla y el contrato revierte.
    await viem.assertions.revertWithCustomError(
      llamador.write.llamarConEncodeCall([llamador.address, 1n]),
      llamador,
      "LlamadaFallida",
    );
  });

  it("staticcall lee sin modificar estado", async function () {
    const { objetivo, llamador } = await desplegar();
    await objetivo.write.establecer([42n]);

    assert.equal(await llamador.read.leerConStaticcall([objetivo.address]), 42n);
  });

  it("enviarEth manda ETH con call", async function () {
    const { llamador } = await desplegar();
    await owner.sendTransaction({ to: llamador.address, value: 1000n });

    const antes = await publicClient.getBalance({ address: alice.account.address });
    await llamador.write.enviarEth([alice.account.address, 400n]);
    const despues = await publicClient.getBalance({ address: alice.account.address });

    assert.equal(despues - antes, 400n);
    assert.equal(await publicClient.getBalance({ address: llamador.address }), 600n);
  });

  it("enviarEth revierte si el destino no acepta ETH", async function () {
    const { objetivo, llamador } = await desplegar();
    await owner.sendTransaction({ to: llamador.address, value: 1000n });

    await viem.assertions.revertWithCustomError(
      llamador.write.enviarEth([objetivo.address, 400n]),
      llamador,
      "EnvioFallido",
    );
  });

  it("el selector son los primeros 4 bytes del keccak256 de la firma", async function () {
    const { llamador } = await desplegar();

    assert.equal(await llamador.read.selectorDeEstablecer(), toFunctionSelector("establecer(uint256)"));
    assert.notEqual(zeroAddress, llamador.address);
  });
});
