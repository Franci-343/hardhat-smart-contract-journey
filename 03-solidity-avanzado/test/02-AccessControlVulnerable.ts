import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, parseEther } from "viem";

describe("02 - Vulnerabilidades de control de acceso", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, cualquiera, atacante] = await viem.getWalletClients();

  describe("falta un modifier", function () {
    it("cualquiera puede declararse ganador y cobrar el premio", async function () {
      const cofre = await viem.deployContract("CofrePremiosVulnerable", [], { value: parseEther("1") });

      // "cualquiera" no es el admin, y sin embargo puede hacer esto.
      await cofre.write.declararGanador([cualquiera.account.address], { account: cualquiera.account });

      assert.equal(getAddress(await cofre.read.ganador()), getAddress(cualquiera.account.address));

      const antes = await publicClient.getBalance({ address: cualquiera.account.address });
      await cofre.write.reclamarPremio({ account: cualquiera.account });
      const despues = await publicClient.getBalance({ address: cualquiera.account.address });

      assert.ok(despues > antes, "deberia haber cobrado el premio sin ser el admin");
    });

    it("la version segura exige ser el admin", async function () {
      const cofre = await viem.deployContract("CofrePremiosSeguro", [], { value: parseEther("1") });

      await viem.assertions.revertWithCustomErrorWithArgs(
        cofre.write.declararGanador([cualquiera.account.address], { account: cualquiera.account }),
        cofre,
        "NoEsAdmin",
        [cualquiera.account.address],
      );

      await cofre.write.declararGanador([cualquiera.account.address], { account: owner.account });
      assert.equal(getAddress(await cofre.read.ganador()), getAddress(cualquiera.account.address));
    });
  });

  describe("tx.origin en vez de msg.sender", function () {
    it("el phishing vacia el banco aunque msg.sender no sea el owner", async function () {
      const banco = await viem.deployContract("BancoConTxOrigin", [], { value: parseEther("10") });
      const trampa = await viem.deployContract("ContratoPhishing", [banco.address, atacante.account.address]);

      const antesAtacante = await publicClient.getBalance({ address: atacante.account.address });

      // El OWNER firma esta transaccion: cree que va a "reclamar una
      // recompensa". tx.origin sera el owner; msg.sender dentro del banco
      // sera el contrato `trampa`, no el owner.
      await trampa.write.reclamarRecompensa({ account: owner.account });

      const despuesAtacante = await publicClient.getBalance({ address: atacante.account.address });

      assert.equal(await banco.read.contractBalance(), 0n);
      assert.equal(despuesAtacante - antesAtacante, parseEther("10"));
    });

    it("la version segura no se deja enganar por el mismo phishing", async function () {
      const banco = await viem.deployContract("BancoSeguro", [], { value: parseEther("10") });
      const trampa = await viem.deployContract("ContratoPhishingContraSeguro", [
        banco.address,
        atacante.account.address,
      ]);

      // Aunque el owner firme la transaccion, msg.sender dentro del banco
      // es `trampa`, no el owner: la comprobacion falla.
      await viem.assertions.revertWith(trampa.write.reclamarRecompensa({ account: owner.account }), "No autorizado");

      assert.equal(await banco.read.contractBalance(), parseEther("10"));
    });

    it("el owner real si puede retirar de la version segura", async function () {
      const banco = await viem.deployContract("BancoSeguro", [], { value: parseEther("10") });

      await banco.write.retirarTodo([atacante.account.address], { account: owner.account });

      assert.equal(await banco.read.contractBalance(), 0n);
    });
  });
});
