import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { maxUint256, parseEther } from "viem";

describe("03 - Aritmetica y unchecked", async function () {
  const { viem } = await network.create();

  it("unchecked permite un underflow silencioso al retirar", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");
    await contrato.write.depositar({ value: 10n });

    // Nadie revierte: 10 - 11 da la vuelta a type(uint256).max.
    await contrato.write.retirarSinCheckVulnerable([11n]);

    const [owner] = await viem.getWalletClients();
    assert.equal(await contrato.read.balances([owner.account.address]), maxUint256);
  });

  it("la resta protegida revierte con un underflow real", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");
    await contrato.write.depositar({ value: 10n });

    await viem.assertions.revert(contrato.write.retirarConCheck([11n]));

    const [owner] = await viem.getWalletClients();
    assert.equal(await contrato.read.balances([owner.account.address]), 10n);
  });

  it("unchecked permite que una suma de la vuelta a cero", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");

    assert.equal(await contrato.read.sumarConOverflow([maxUint256, 1n]), 0n);
  });

  it("la suma protegida revierte en vez de dar la vuelta", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");

    await viem.assertions.revert(contrato.read.sumarConCheck([maxUint256, 1n]));
  });

  it("convertir a un tipo mas chico trunca en silencio (no es unchecked)", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");

    // 300 mod 256 = 44. No revierte, ni siquiera fuera de un bloque unchecked.
    assert.equal(await contrato.read.truncarAUint8([300n]), 44);
    assert.equal(await contrato.read.truncarAUint8([256n]), 0);
    assert.equal(await contrato.read.truncarAUint8([255n]), 255);
  });

  it("unchecked en el contador de un for es seguro y da el mismo resultado", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");

    assert.equal(await contrato.read.sumarArray([[1n, 2n, 3n, 4n]]), 10n);
  });

  it("depositar varias veces acumula el balance normalmente", async function () {
    const contrato = await viem.deployContract("AritmeticaUnchecked");
    const [owner] = await viem.getWalletClients();

    await contrato.write.depositar({ value: parseEther("1") });
    await contrato.write.depositar({ value: parseEther("2") });

    assert.equal(await contrato.read.balances([owner.account.address]), parseEther("3"));
  });
});
