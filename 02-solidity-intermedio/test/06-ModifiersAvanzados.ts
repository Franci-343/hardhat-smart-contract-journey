import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, toFunctionSelector } from "viem";

describe("06 - Modifiers avanzados", async function () {
  const { viem, networkHelpers } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, alice] = await viem.getWalletClients();

  it("soloOwner: solo el owner puede cambiar el owner", async function () {
    const contrato = await viem.deployContract("ModifiersAvanzados");

    await viem.assertions.revertWithCustomErrorWithArgs(
      contrato.write.cambiarOwner([alice.account.address], { account: alice.account }),
      contrato,
      "NoAutorizado",
      [alice.account.address],
    );

    await contrato.write.cambiarOwner([alice.account.address]);
    assert.equal((await contrato.read.owner()).toLowerCase(), alice.account.address.toLowerCase());
  });

  it("valorMinimo(parametro): exige un minimo de ETH", async function () {
    const contrato = await viem.deployContract("ModifiersAvanzados");

    await viem.assertions.revertWithCustomErrorWithArgs(
      contrato.write.depositar({ value: parseEther("0.001") }),
      contrato,
      "ValorInsuficiente",
      [parseEther("0.001"), parseEther("0.01")],
    );

    await contrato.write.depositar({ value: parseEther("0.01") });
    assert.equal(await contrato.read.saldos([owner.account.address]), parseEther("0.01"));
  });

  it("cooldown: codigo antes y despues de `_`", async function () {
    const contrato = await viem.deployContract("ModifiersAvanzados");

    await contrato.write.accionConCooldown();

    // Segunda llamada inmediata: el modifier la rechaza.
    await viem.assertions.revertWithCustomError(contrato.write.accionConCooldown(), contrato, "EnCooldown");

    // Pasada la hora de espera, vuelve a funcionar.
    await networkHelpers.time.increase(3600);
    await contrato.write.accionConCooldown();
  });

  it("contarLlamada: ejecuta codigo DESPUES de la funcion", async function () {
    const contrato = await viem.deployContract("ModifiersAvanzados");

    assert.equal(await contrato.read.llamadas(), 0n);

    await contrato.write.accionConCooldown();
    await contrato.write.depositar({ value: parseEther("0.01") });

    assert.equal(await contrato.read.llamadas(), 2n);
  });

  it("noReentrante: bloquea el intento de volver a entrar a retirar()", async function () {
    const objetivo = await viem.deployContract("ModifiersAvanzados");
    const atacante = await viem.deployContract("AtacanteReentrada", [objetivo.address]);

    await atacante.write.atacar({ value: parseEther("1") });

    // El atacante recibio su propio deposito una sola vez...
    assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("1"));
    assert.equal(await publicClient.getBalance({ address: objetivo.address }), 0n);

    // ...y el segundo intento fue rechazado por el modifier.
    assert.equal(await atacante.read.errorDeReentrada(), toFunctionSelector("Reentrada()"));
  });

  it("retirar sin saldo revierte", async function () {
    const contrato = await viem.deployContract("ModifiersAvanzados");

    await viem.assertions.revertWithCustomError(contrato.write.retirar(), contrato, "SinSaldo");
  });
});
