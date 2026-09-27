import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeFunctionData, getAddress } from "viem";

describe("11 - Contratos actualizables (UUPS)", async function () {
  const { viem } = await network.create();
  const [owner, alguien] = await viem.getWalletClients();

  async function desplegarProxyV1() {
    const v1 = await viem.deployContract("LogicaUUPS_V1");
    const datosInit = encodeFunctionData({
      abi: v1.abi,
      functionName: "initialize",
      args: [owner.account.address],
    });

    const proxy = await viem.deployContract("ProxyUUPS", [v1.address, datosInit]);
    const proxyComoV1 = await viem.getContractAt("LogicaUUPS_V1", proxy.address);

    return { v1, proxy, proxyComoV1 };
  }

  it("initialize() corre sobre el storage del proxy, no el de la logica", async function () {
    const { v1, proxyComoV1 } = await desplegarProxyV1();

    assert.equal(getAddress(await proxyComoV1.read.owner()), getAddress(owner.account.address));
    // La logica en si misma nunca tuvo owner: initialize() se ejecuto via
    // delegatecall, sobre el storage del proxy.
    assert.equal(await v1.read.owner(), "0x0000000000000000000000000000000000000000");
  });

  it("initialize() no se puede llamar dos veces a traves del proxy", async function () {
    const { proxyComoV1 } = await desplegarProxyV1();

    await viem.assertions.revertWithCustomError(
      proxyComoV1.write.initialize([alguien.account.address]),
      proxyComoV1,
      "YaInicializado",
    );
  });

  it("initialize() tampoco se puede llamar directamente sobre la logica", async function () {
    const v1 = await viem.deployContract("LogicaUUPS_V1");

    // El constructor de BaseActualizable ya marco esta direccion como
    // inicializada en el momento de desplegarla.
    await viem.assertions.revertWithCustomError(
      v1.write.initialize([alguien.account.address]),
      v1,
      "YaInicializado",
    );
  });

  it("upgradeTo se ejecuta desde la logica pero escribe el slot del proxy", async function () {
    const { v1, proxy, proxyComoV1 } = await desplegarProxyV1();
    const v2 = await viem.deployContract("LogicaUUPS_V2");

    await proxyComoV1.write.establecer([42n]);

    await viem.assertions.emitWithArgs(proxyComoV1.write.upgradeTo([v2.address]), proxyComoV1, "Actualizado", [
      v1.address,
      v2.address,
    ]);

    const proxyComoV2 = await viem.getContractAt("LogicaUUPS_V2", proxy.address);

    assert.equal(getAddress(await proxyComoV2.read.implementacion()), getAddress(v2.address));

    // El estado que ya existia sigue ahi: la actualizacion no lo toco.
    assert.equal(await proxyComoV2.read.valor(), 42n);

    // Y ya se puede usar lo que solo existe en V2.
    await proxyComoV2.write.establecerExtra([7n]);
    assert.equal(await proxyComoV2.read.extra(), 7n);
  });

  it("solo el owner puede actualizar", async function () {
    const { proxyComoV1 } = await desplegarProxyV1();
    const v2 = await viem.deployContract("LogicaUUPS_V2");

    await viem.assertions.revertWith(
      proxyComoV1.write.upgradeTo([v2.address], { account: alguien.account }),
      "No autorizado",
    );
  });

  it("una actualizacion que inserta una variable en el medio corrompe el estado existente", async function () {
    const { proxyComoV1, proxy } = await desplegarProxyV1();
    const v2Malo = await viem.deployContract("LogicaUUPS_V2Malo");

    await proxyComoV1.write.establecer([42n]);
    await proxyComoV1.write.upgradeTo([v2Malo.address]);

    const proxyComoV2Malo = await viem.getContractAt("LogicaUUPS_V2Malo", proxy.address);

    // El 42 que se guardo como "valor" en V1 ahora se lee bajo la etiqueta
    // "nueva" (V2Malo la inserto justo donde estaba `valor`).
    assert.equal(await proxyComoV2Malo.read.nueva(), 42n);

    // Y lo que V2Malo llama "valor" en realidad es un slot que nunca se
    // escribio: aparece vacio.
    assert.equal(await proxyComoV2Malo.read.valor(), 0n);
  });
});
