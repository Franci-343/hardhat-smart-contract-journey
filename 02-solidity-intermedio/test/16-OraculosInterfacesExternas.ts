import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("16 - Oraculos e interfaces externas", async function () {
  const { viem, networkHelpers } = await network.create();
  const [owner] = await viem.getWalletClients();

  const PRECIO_ETH = 2000n * 10n ** 8n; // 2000 USD con 8 decimales, como Chainlink
  const MAX_ANTIGUEDAD = 3600n; // 1 hora

  async function desplegarTodo() {
    const oraculo = await viem.deployContract("AggregatorMock", [8, PRECIO_ETH]);
    const consumidor = await viem.deployContract("ConsumidorPrecio", [oraculo.address, MAX_ANTIGUEDAD]);
    return { oraculo, consumidor };
  }

  it("el oraculo mock cumple la interfaz de Chainlink", async function () {
    const { oraculo } = await networkHelpers.loadFixture(desplegarTodo);

    assert.equal(await oraculo.read.decimals(), 8);
    assert.equal(await oraculo.read.description(), "ETH / USD (mock)");

    const [ronda, precio] = await oraculo.read.latestRoundData();
    assert.equal(ronda, 1n);
    assert.equal(precio, PRECIO_ETH);
  });

  it("el consumidor lee el precio del oraculo", async function () {
    const { consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    assert.equal(await consumidor.read.precioEth(), PRECIO_ETH);
  });

  it("convierte ETH a USD con 18 decimales", async function () {
    const { consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    assert.equal(await consumidor.read.ethAUsd([parseEther("1")]), parseEther("2000"));
    assert.equal(await consumidor.read.ethAUsd([parseEther("0.5")]), parseEther("1000"));
  });

  it("refleja los cambios de precio del oraculo", async function () {
    const { oraculo, consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    await oraculo.write.actualizarPrecio([3000n * 10n ** 8n]);

    assert.equal(await consumidor.read.ethAUsd([parseEther("1")]), parseEther("3000"));
  });

  it("aportar exige un minimo de 5 USD", async function () {
    const { consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    // 0.001 ETH = 2 USD: menos del minimo.
    await viem.assertions.revertWithCustomError(
      consumidor.write.aportar({ value: parseEther("0.001") }),
      consumidor,
      "AporteInsuficiente",
    );

    // 0.01 ETH = 20 USD: aceptado.
    await viem.assertions.emitWithArgs(consumidor.write.aportar({ value: parseEther("0.01") }), consumidor, "Aportado", [
      owner.account.address,
      parseEther("0.01"),
      parseEther("20"),
    ]);
    assert.equal(await consumidor.read.aportes([owner.account.address]), parseEther("0.01"));
  });

  it("rechaza un precio negativo o cero", async function () {
    const { oraculo, consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    await oraculo.write.actualizarPrecio([-1n]);
    await viem.assertions.revertWithCustomError(consumidor.read.precioEth(), consumidor, "PrecioInvalido");

    await oraculo.write.actualizarPrecio([0n]);
    await viem.assertions.revertWithCustomError(consumidor.read.precioEth(), consumidor, "PrecioInvalido");
  });

  it("rechaza un precio obsoleto (oraculo sin actualizar)", async function () {
    const { oraculo, consumidor } = await networkHelpers.loadFixture(desplegarTodo);

    await networkHelpers.time.increase(7200); // pasan 2 horas sin actualizacion

    await viem.assertions.revertWithCustomError(consumidor.read.precioEth(), consumidor, "PrecioObsoleto");

    // Cuando el oraculo se actualiza, vuelve a funcionar.
    await oraculo.write.actualizarPrecio([PRECIO_ETH]);
    assert.equal(await consumidor.read.precioEth(), PRECIO_ETH);
  });
});
