import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("05 - Gas I: empaquetado de storage", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  it("guarda los mismos datos en ambos ordenes", async function () {
    const contrato = await viem.deployContract("GasPackingStorage");

    await contrato.write.agregarDesordenado([1n, 2n, 3n, 4n, true]);
    await contrato.write.agregarEmpacado([1n, 2n, 3n, 4n, true]);

    assert.deepEqual(await contrato.read.desordenados([0n]), [1n, 2n, 3n, 4n, true]);
    assert.deepEqual(await contrato.read.empacados([0n]), [2n, 1n, 3n, 4n, true]);
  });

  it("el struct empacado (3 slots) gasta menos que el desordenado (4 slots)", async function () {
    const contrato = await viem.deployContract("GasPackingStorage");

    const gasDesordenado = await publicClient.estimateContractGas({
      address: contrato.address,
      abi: contrato.abi,
      functionName: "agregarDesordenado",
      args: [1n, 2n, 3n, 4n, true],
    });

    const gasEmpacado = await publicClient.estimateContractGas({
      address: contrato.address,
      abi: contrato.abi,
      functionName: "agregarEmpacado",
      args: [1n, 2n, 3n, 4n, true],
    });

    assert.ok(gasEmpacado < gasDesordenado, `empacado=${gasEmpacado} desordenado=${gasDesordenado}`);

    // La diferencia deberia ser del orden de un slot nuevo de storage
    // (~20 000 gas por escribir un slot que antes estaba en cero).
    const diferencia = gasDesordenado - gasEmpacado;
    assert.ok(diferencia > 10_000n, `la diferencia (${diferencia}) deberia rondar un slot completo`);
  });
});
