import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeFunctionData } from "viem";

describe("08 - storage, memory y calldata", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  it("guarda usuarios en storage", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");

    await contrato.write.agregarUsuario(["Ana", 10n]);

    assert.equal(await contrato.read.totalUsuarios(), 1n);
    assert.deepEqual(await contrato.read.usuarios([0n]), ["Ana", 10n]);
  });

  it("un puntero `storage` modifica el dato original", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");
    await contrato.write.agregarUsuario(["Ana", 10n]);

    await contrato.write.sumarPuntosEnStorage([0n, 5n]);

    assert.deepEqual(await contrato.read.usuarios([0n]), ["Ana", 15n]);
  });

  it("una copia en `memory` NO modifica el storage", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");
    await contrato.write.agregarUsuario(["Ana", 10n]);

    // La copia si cambia (devuelve 15)...
    assert.equal(await contrato.read.sumarPuntosEnMemory([0n, 5n]), 15n);
    // ...pero el dato guardado sigue igual.
    assert.deepEqual(await contrato.read.usuarios([0n]), ["Ana", 10n]);
  });

  it("calldata y memory dan el mismo resultado", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");
    const datos = [1n, 2n, 3n, 4n];

    assert.equal(await contrato.read.sumarCalldata([datos]), 10n);
    assert.equal(await contrato.read.sumarMemory([datos]), 10n);
  });

  it("se puede construir un array nuevo en memory", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");

    assert.deepEqual(await contrato.read.duplicar([[1n, 2n, 3n]]), [2n, 4n, 6n]);
  });

  it("calldata gasta menos gas que memory con arrays grandes", async function () {
    const contrato = await viem.deployContract("StorageMemoryCalldata");
    const datos = Array.from({ length: 100 }, (_, i) => BigInt(i));

    const gasCalldata = await publicClient.estimateGas({
      to: contrato.address,
      data: encodeFunctionData({ abi: contrato.abi, functionName: "sumarCalldata", args: [datos] }),
    });
    const gasMemory = await publicClient.estimateGas({
      to: contrato.address,
      data: encodeFunctionData({ abi: contrato.abi, functionName: "sumarMemory", args: [datos] }),
    });

    assert.ok(gasCalldata < gasMemory, `calldata=${gasCalldata} memory=${gasMemory}`);
  });
});
