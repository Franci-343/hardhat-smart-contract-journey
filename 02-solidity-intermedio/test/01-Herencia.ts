import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("01 - Herencia", async function () {
  const { viem } = await network.create();

  it("el padre Animal tiene comportamiento por defecto", async function () {
    const animal = await viem.deployContract("Animal");

    assert.equal(await animal.read.especie(), "Animal");
    assert.equal(await animal.read.sonido(), "...");
    assert.equal(await animal.read.presentarse(), "Animal dice: ...");
  });

  it("Perro hereda de Animal y sobrescribe sonido()", async function () {
    const perro = await viem.deployContract("Perro");

    assert.equal(await perro.read.especie(), "Perro");
    assert.equal(await perro.read.sonido(), "Guau");
  });

  it("presentarse() del padre usa el sonido() del hijo (polimorfismo)", async function () {
    const perro = await viem.deployContract("Perro");

    assert.equal(await perro.read.presentarse(), "Perro dice: Guau");
  });

  it("herencia de varios niveles: Cachorro -> Perro -> Animal", async function () {
    const cachorro = await viem.deployContract("Cachorro");

    assert.equal(await cachorro.read.especie(), "Cachorro");
    assert.equal(await cachorro.read.presentarse(), "Cachorro dice: Guau suave");
  });

  it("herencia multiple: Pato combina Volador y Nadador", async function () {
    const volador = await viem.deployContract("Volador");
    const nadador = await viem.deployContract("Nadador");
    const pato = await viem.deployContract("Pato");

    assert.equal(await volador.read.moverse(), "Vuela");
    assert.equal(await nadador.read.moverse(), "Nada");
    assert.equal(await pato.read.moverse(), "Vuela y Nada");
  });
});
