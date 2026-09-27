import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("01 - Reentrancy", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, victima, complice] = await viem.getWalletClients();

  describe("misma funcion (drena la boveda entera)", function () {
    it("el atacante retira mucho mas de lo que deposito", async function () {
      const boveda = await viem.deployContract("BovedaVulnerable");
      const atacante = await viem.deployContract("AtacanteReentradaSimple", [boveda.address]);

      // La victima deposita 5 ETH de buena fe.
      await boveda.write.depositar({ value: parseEther("5"), account: victima.account });

      // El atacante solo deposita 1 ETH.
      await atacante.write.atacar({ value: parseEther("1") });

      // Pero se retiro TODO el contrato: su 1 ETH + los 5 ETH de la victima.
      assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("6"));
      assert.equal(await boveda.read.contractBalance(), 0n);

      // La victima "todavia tiene" su balance interno, pero ya no hay ETH real
      // en el contrato para pagarselo: la boveda quedo insolvente.
      assert.equal(await boveda.read.balances([victima.account.address]), parseEther("5"));
      await viem.assertions.revert(boveda.write.retirar({ account: victima.account }));
    });
  });

  describe("cruzada (entre dos funciones distintas)", function () {
    it("el atacante regala a un complice un saldo que ya deberia ser cero", async function () {
      const boveda = await viem.deployContract("BovedaVulnerableCruzada");
      const atacante = await viem.deployContract("AtacanteReentradaCruzada", [
        boveda.address,
        complice.account.address,
      ]);

      await boveda.write.depositar({ value: parseEther("5"), account: victima.account });
      await atacante.write.atacar({ value: parseEther("1") });

      // El atacante recupero su propio ETH...
      assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("1"));

      // ...Y ADEMAS el complice recibio un balance interno de 1 ETH que
      // nadie deposito realmente: es un reclamo fantasma.
      assert.equal(await boveda.read.balances([complice.account.address]), parseEther("1"));
      assert.equal(await boveda.read.balances([atacante.address]), 0n);

      // El contrato solo tiene el ETH de la victima (5), pero ahora "debe"
      // 5 (victima) + 1 (complice) = 6: esta insolvente.
      const contractBalance = await publicClient.getBalance({ address: boveda.address });
      const prometido =
        (await boveda.read.balances([victima.account.address])) +
        (await boveda.read.balances([complice.account.address]));

      assert.equal(contractBalance, parseEther("5"));
      assert.equal(prometido, parseEther("6"));
      assert.ok(prometido > contractBalance, "la boveda deberia estar insolvente");
    });
  });

  describe("version corregida (checks-effects-interactions + guard)", function () {
    it("el ataque de la misma funcion ya no funciona", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      const atacante = await viem.deployContract("AtacanteContraBovedaSegura", [boveda.address]);

      await boveda.write.depositar({ value: parseEther("5"), account: victima.account });
      await atacante.write.atacar({ value: parseEther("1") });

      // El atacante solo recupera lo que deposito, ni un wei mas.
      assert.equal(await publicClient.getBalance({ address: atacante.address }), parseEther("1"));
      assert.equal(await boveda.read.contractBalance(), parseEther("5"));

      // El intento de reentrar quedo registrado, pero no logro nada.
      assert.equal(await atacante.read.vecesQueRetiro(), 1n);

      // La victima puede retirar su ETH sin problema.
      await boveda.write.retirar({ account: victima.account });
      assert.equal(await boveda.read.contractBalance(), 0n);
    });

    it("retirar sin saldo revierte", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await viem.assertions.revertWith(boveda.write.retirar({ account: owner.account }), "Sin saldo");
    });
  });
});
