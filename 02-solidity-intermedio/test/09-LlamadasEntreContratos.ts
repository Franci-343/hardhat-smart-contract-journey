import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("09 - Llamadas entre contratos", async function () {
  const { viem } = await network.create();
  const [owner] = await viem.getWalletClients();

  it("un usuario llama directamente a Contador", async function () {
    const contador = await viem.deployContract("Contador");

    await contador.write.incrementar();

    assert.equal(await contador.read.valor(), 1n);
    assert.equal(getAddress(await contador.read.ultimoSender()), getAddress(owner.account.address));
  });

  it("Llamador incrementa el Contador a traves de la interfaz", async function () {
    const contador = await viem.deployContract("Contador");
    const llamador = await viem.deployContract("Llamador", [contador.address]);

    await llamador.write.incrementarRemoto();
    await llamador.write.incrementarRemoto();
    await llamador.write.establecerRemoto([50n]);

    assert.equal(await contador.read.valor(), 50n);
    assert.equal(await llamador.read.leerRemoto(), 50n);
  });

  it("msg.sender es el contrato Llamador, tx.origin es el usuario", async function () {
    const contador = await viem.deployContract("Contador");
    const llamador = await viem.deployContract("Llamador", [contador.address]);

    await llamador.write.incrementarRemoto();

    assert.equal(getAddress(await contador.read.ultimoSender()), getAddress(llamador.address));
    assert.equal(getAddress(await contador.read.ultimoOrigen()), getAddress(owner.account.address));
  });

  it("FabricaContadores crea contratos nuevos con `new`", async function () {
    const fabrica = await viem.deployContract("FabricaContadores");

    await fabrica.write.crear();
    await fabrica.write.crear();

    assert.equal(await fabrica.read.totalCreados(), 2n);

    const primero = await viem.getContractAt("Contador", await fabrica.read.creados([0n]));
    const segundo = await viem.getContractAt("Contador", await fabrica.read.creados([1n]));

    assert.notEqual(getAddress(primero.address), getAddress(segundo.address));

    await primero.write.incrementar();
    assert.equal(await primero.read.valor(), 1n);
    assert.equal(await segundo.read.valor(), 0n); // cada contrato tiene su propio estado
  });

  it("la fabrica emite el evento con la direccion creada", async function () {
    const fabrica = await viem.deployContract("FabricaContadores");

    await viem.assertions.emit(fabrica.write.crear(), fabrica, "ContadorCreado");
  });
});
