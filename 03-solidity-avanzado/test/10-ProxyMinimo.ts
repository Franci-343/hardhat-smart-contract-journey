import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("10 - Proxy minimo (EIP-1967)", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, alguien] = await viem.getWalletClients();

  const SLOT_IMPLEMENTACION = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as const;

  it("delegar llamadas a traves del proxy modifica el storage del PROXY", async function () {
    const v1 = await viem.deployContract("ImplementacionV1");
    const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

    // Hablamos con la direccion del proxy, pero usando el ABI de la
    // implementacion: es el patron estandar para probar proxies.
    const proxyComoV1 = await viem.getContractAt("ImplementacionV1", proxy.address);

    await proxyComoV1.write.establecer([10n]);
    assert.equal(await proxyComoV1.read.valor(), 10n);

    // La implementacion en si misma nunca guardo nada: delegatecall opero
    // sobre el storage del proxy, no sobre el de v1.
    assert.equal(await v1.read.valor(), 0n);

    await proxyComoV1.write.duplicar();
    assert.equal(await proxyComoV1.read.valor(), 20n);
  });

  it("la direccion de la implementacion vive exactamente en el slot EIP-1967", async function () {
    const v1 = await viem.deployContract("ImplementacionV1");
    const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

    assert.equal(getAddress(await proxy.read.implementacion()), getAddress(v1.address));

    const crudo = await publicClient.getStorageAt({ address: proxy.address, slot: SLOT_IMPLEMENTACION });
    const direccionCruda = getAddress(`0x${crudo!.slice(-40)}`);

    assert.equal(direccionCruda, getAddress(v1.address));
  });

  it("actualizar cambia el codigo ejecutado sin perder el estado guardado", async function () {
    const v1 = await viem.deployContract("ImplementacionV1");
    const v2 = await viem.deployContract("ImplementacionV2");
    const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

    const proxyComoV1 = await viem.getContractAt("ImplementacionV1", proxy.address);
    await proxyComoV1.write.establecer([10n]);

    await viem.assertions.emitWithArgs(proxy.write.actualizar([v2.address]), proxy, "Actualizado", [
      v1.address,
      v2.address,
    ]);

    assert.equal(getAddress(await proxy.read.implementacion()), getAddress(v2.address));

    // El mismo numero sigue ahi: el slot 0 del proxy nunca cambio, solo
    // cambio que codigo se ejecuta cuando alguien escribe o lee ese slot.
    const proxyComoV2 = await viem.getContractAt("ImplementacionV2", proxy.address);
    assert.equal(await proxyComoV2.read.valor(), 10n);

    // Y ya se puede usar la funcion nueva que solo existe en V2.
    await proxyComoV2.write.triplicar();
    assert.equal(await proxyComoV2.read.valor(), 30n);
  });

  it("solo el admin puede actualizar la implementacion", async function () {
    const v1 = await viem.deployContract("ImplementacionV1");
    const v2 = await viem.deployContract("ImplementacionV2");
    const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

    await viem.assertions.revertWith(
      proxy.write.actualizar([v2.address], { account: alguien.account }),
      "No autorizado",
    );
  });

  it("no se puede actualizar a una direccion sin codigo", async function () {
    const v1 = await viem.deployContract("ImplementacionV1");
    const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

    await viem.assertions.revertWith(
      proxy.write.actualizar([alguien.account.address]),
      "La implementacion debe ser un contrato",
    );
  });
});
