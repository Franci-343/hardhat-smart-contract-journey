import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("15 - Manipulacion de oraculos y flash loans", async function () {
  const { viem } = await network.create();
  const [owner] = await viem.getWalletClients();

  async function desplegarEscenario() {
    const tokenA = await viem.deployContract("TokenDePrueba", ["Token A", "TKA", 1_000_000n]);
    const tokenB = await viem.deployContract("TokenDePrueba", ["Token B", "TKB", 1_000_000n]);

    const pool = await viem.deployContract("PoolSimple", [tokenA.address, tokenB.address]);
    await tokenA.write.approve([pool.address, 10_000n]);
    await tokenB.write.approve([pool.address, 10_000n]);
    await pool.write.agregarLiquidez([10_000n, 10_000n]);

    const proveedor = await viem.deployContract("ProveedorFlashLoan", [tokenB.address]);
    await tokenB.write.approve([proveedor.address, 50_000n]);
    await proveedor.write.fondear([50_000n]);

    return { tokenA, tokenB, pool, proveedor };
  }

  it("la pool tiene precio 1:1 antes de cualquier ataque", async function () {
    const { pool } = await desplegarEscenario();

    assert.equal(await pool.read.precioSpotAenB(), 10n ** 18n);
  });

  describe("consumidor vulnerable (precio spot de la pool)", function () {
    it("el flash loan financia un ataque rentable sin capital propio", async function () {
      const { tokenA, tokenB, pool, proveedor } = await desplegarEscenario();

      const consumidor = await viem.deployContract("ConsumidorOraculoVulnerable", [
        pool.address,
        tokenA.address,
        tokenB.address,
      ]);
      await tokenB.write.approve([consumidor.address, 50_000n]);
      await consumidor.write.fondear([50_000n]);

      const atacante = await viem.deployContract("AtacanteFlashLoan", [
        proveedor.address,
        pool.address,
        consumidor.address,
        tokenA.address,
        tokenB.address,
      ]);

      // El atacante ejecuta todo en una sola llamada, sin haber depositado
      // NADA de su propio capital en el contrato atacante.
      assert.equal(await tokenB.read.balanceOf([atacante.address]), 0n);

      await atacante.write.atacar([5_000n]);

      const ganancia = await atacante.read.gananciaEnB();
      assert.ok(ganancia > 0n, `el ataque deberia haber sido rentable (ganancia=${ganancia})`);

      // La pool volvio a tener sentido? No: quedo con el precio distorsionado,
      // pero eso no es lo que perjudico al consumidor. Lo que importa es que
      // el consumidor pago de mas por un colateral que en realidad vale menos.
      const precioFinal = await pool.read.precioSpotAenB();
      assert.notEqual(precioFinal, 10n ** 18n);
    });
  });

  describe("consumidor seguro (precio de una fuente separada)", function () {
    it("el mismo ataque, contra un precio fijo, no genera ganancia", async function () {
      const { tokenA, tokenB, pool, proveedor } = await desplegarEscenario();

      // Precio fijo 1:1, igual al de la pool ANTES de manipularla.
      const consumidor = await viem.deployContract("ConsumidorOraculoSeguro", [
        tokenA.address,
        tokenB.address,
        10n ** 18n,
      ]);
      await tokenB.write.approve([consumidor.address, 50_000n]);
      await consumidor.write.fondear([50_000n]);

      const atacante = await viem.deployContract("AtacanteFlashLoan", [
        proveedor.address,
        pool.address,
        consumidor.address,
        tokenA.address,
        tokenB.address,
      ]);

      // Comprar caro en la pool (por el slippage) y vender al mismo precio
      // de siempre deja PERDIDA, no ganancia: el atacante ni siquiera junta
      // lo suficiente para devolver el flash loan con su comision, y la
      // transaccion completa revierte (como si nada hubiera pasado).
      await viem.assertions.revert(atacante.write.atacar([5_000n]));
    });

    it("solo el admin puede actualizar el precio de la fuente confiable", async function () {
      const { tokenA, tokenB } = await desplegarEscenario();
      const [, otro] = await viem.getWalletClients();

      const consumidor = await viem.deployContract("ConsumidorOraculoSeguro", [
        tokenA.address,
        tokenB.address,
        10n ** 18n,
      ]);

      await viem.assertions.revertWith(
        consumidor.write.actualizarPrecio([2n * 10n ** 18n], { account: otro.account }),
        "No autorizado",
      );

      await consumidor.write.actualizarPrecio([2n * 10n ** 18n]);
      assert.equal(await consumidor.read.precioAenB(), 2n * 10n ** 18n);
    });
  });
});
