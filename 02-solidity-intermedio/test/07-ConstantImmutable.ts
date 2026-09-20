import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeFunctionData } from "viem";

describe("07 - constant e immutable", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner] = await viem.getWalletClients();

  it("las constantes tienen su valor desde la compilacion", async function () {
    const contrato = await viem.deployContract("ConstantImmutable", [250n]);

    assert.equal(await contrato.read.MAX_SUPPLY(), 1_000_000n);
    assert.equal(await contrato.read.NOMBRE(), "Curso Intermedio");
  });

  it("los immutable se fijan en el constructor", async function () {
    const contrato = await viem.deployContract("ConstantImmutable", [250n]);
    const bloque = await publicClient.getBlock();

    assert.equal((await contrato.read.OWNER()).toLowerCase(), owner.account.address.toLowerCase());
    assert.equal(await contrato.read.FEE_BPS(), 250n);
    assert.equal(await contrato.read.CREADO_EN(), bloque.timestamp);
  });

  it("calcula el fee con immutable y con storage (mismo resultado)", async function () {
    const contrato = await viem.deployContract("ConstantImmutable", [250n]);

    assert.equal(await contrato.read.calcularFeeConImmutable([10_000n]), 250n);
    assert.equal(await contrato.read.calcularFeeConStorage([10_000n]), 250n);
  });

  it("leer un immutable cuesta menos gas que leer storage", async function () {
    const contrato = await viem.deployContract("ConstantImmutable", [250n]);

    const gasImmutable = await publicClient.estimateGas({
      to: contrato.address,
      data: encodeFunctionData({ abi: contrato.abi, functionName: "calcularFeeConImmutable", args: [10_000n] }),
    });
    const gasStorage = await publicClient.estimateGas({
      to: contrato.address,
      data: encodeFunctionData({ abi: contrato.abi, functionName: "calcularFeeConStorage", args: [10_000n] }),
    });

    assert.ok(gasImmutable < gasStorage, `immutable=${gasImmutable} storage=${gasStorage}`);
  });

  it("el constructor rechaza un fee mayor al 100%", async function () {
    await assert.rejects(viem.deployContract("ConstantImmutable", [10_001n]));
  });
});
