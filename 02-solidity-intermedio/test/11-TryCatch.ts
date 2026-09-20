import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { zeroAddress } from "viem";

describe("11 - try/catch", async function () {
  const { viem } = await network.create();

  it("catch Error(string) atrapa el mensaje de un require", async function () {
    const contrato = await viem.deployContract("TryCatch");

    assert.deepEqual(await contrato.read.probarRequire([0n]), [false, "x debe ser mayor a cero"]);
    assert.deepEqual(await contrato.read.probarRequire([5n]), [true, ""]);
  });

  it("catch Panic(uint256) atrapa la division entre cero (0x12)", async function () {
    const contrato = await viem.deployContract("TryCatch");

    assert.deepEqual(await contrato.read.probarDivision([10n, 0n]), [false, 0x12n]);
    assert.deepEqual(await contrato.read.probarDivision([10n, 2n]), [true, 0n]);
  });

  it("catch Panic(uint256) atrapa un assert fallido (0x01)", async function () {
    const contrato = await viem.deployContract("TryCatch");

    assert.equal(await contrato.read.probarAssert(), 0x01n);
  });

  it("catch (bytes) atrapa errores personalizados y se identifican por selector", async function () {
    const contrato = await viem.deployContract("TryCatch");

    assert.deepEqual(await contrato.read.probarErrorPersonalizado([5n]), [true, false]);
    assert.deepEqual(await contrato.read.probarErrorPersonalizado([11n]), [false, true]);
  });

  it("try new atrapa fallos del constructor", async function () {
    const contrato = await viem.deployContract("TryCatch");

    const fallo = await contrato.simulate.crearFragil([0n]);
    assert.deepEqual(fallo.result, [zeroAddress, "Valor no puede ser cero"]);

    const exito = await contrato.simulate.crearFragil([5n]);
    assert.notEqual(exito.result[0], zeroAddress);
    assert.equal(exito.result[1], "");
  });

  it("sin try/catch el error llega al llamador original", async function () {
    const riesgoso = await viem.deployContract("Riesgoso");

    await viem.assertions.revertWith(riesgoso.read.exigirPositivo([0n]), "x debe ser mayor a cero");
    await viem.assertions.revertWithCustomError(riesgoso.read.retirar([11n]), riesgoso, "SaldoInsuficiente");
  });
});
