import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("08 - Assembly / Yul", async function () {
  const { viem } = await network.create();

  it("leer un slot con sload da lo mismo que el getter normal", async function () {
    const contrato = await viem.deployContract("AssemblyYul");

    assert.equal(await contrato.read.leerConAssembly(), 777n);
    assert.equal(await contrato.read.leerNormal(), 777n);
  });

  it("sumar un array con calldataload da lo mismo que el loop normal", async function () {
    const contrato = await viem.deployContract("AssemblyYul");
    const datos = [1n, 2n, 3n, 4n, 5n];

    assert.equal(await contrato.read.sumarConAssembly([datos]), 15n);
    assert.equal(await contrato.read.sumarNormal([datos]), 15n);
  });

  it("sumar un array vacio da cero", async function () {
    const contrato = await viem.deployContract("AssemblyYul");

    assert.equal(await contrato.read.sumarConAssembly([[]]), 0n);
  });

  it("extcodesize distingue un contrato de una cuenta normal", async function () {
    const contrato = await viem.deployContract("AssemblyYul");
    const otroContrato = await viem.deployContract("AssemblyYul");
    const [owner] = await viem.getWalletClients();

    assert.equal(await contrato.read.esContratoConAssembly([otroContrato.address]), true);
    assert.equal(await contrato.read.esContratoNormal([otroContrato.address]), true);

    assert.equal(await contrato.read.esContratoConAssembly([owner.account.address]), false);
    assert.equal(await contrato.read.esContratoNormal([owner.account.address]), false);
  });
});
