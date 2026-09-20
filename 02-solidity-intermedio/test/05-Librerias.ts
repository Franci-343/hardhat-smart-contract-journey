import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("05 - Librerias", async function () {
  const { viem } = await network.create();

  it("MathLib: max y min", async function () {
    const stats = await viem.deployContract("Estadisticas");

    assert.equal(await stats.read.mayorDe([3n, 9n]), 9n);
    assert.equal(await stats.read.mayorDe([9n, 3n]), 9n);
    assert.equal(await stats.read.menorDe([3n, 9n]), 3n);
  });

  it("MathLib: promedio y porcentaje en puntos base", async function () {
    const stats = await viem.deployContract("Estadisticas");

    assert.equal(await stats.read.promedioDe([[10n, 20n, 30n]]), 20n);
    assert.equal(await stats.read.comision([1000n, 250n]), 25n); // 2.5%
    assert.equal(await stats.read.comision([1000n, 10_000n]), 1000n); // 100%
  });

  it("MathLib: promedio de una lista vacia revierte", async function () {
    const stats = await viem.deployContract("Estadisticas");

    await viem.assertions.revertWith(stats.read.promedioDe([[]]), "Sin datos");
  });

  it("ArrayLib: sumar y contiene sobre un array de storage", async function () {
    const stats = await viem.deployContract("Estadisticas");

    await stats.write.agregar([5n]);
    await stats.write.agregar([10n]);
    await stats.write.agregar([15n]);

    assert.equal(await stats.read.total(), 30n);
    assert.equal(await stats.read.existe([10n]), true);
    assert.equal(await stats.read.existe([99n]), false);
  });

  it("ArrayLib: quitar mueve el ultimo elemento al hueco", async function () {
    const stats = await viem.deployContract("Estadisticas");

    await stats.write.agregar([1n]);
    await stats.write.agregar([2n]);
    await stats.write.agregar([3n]);

    await stats.write.quitar([0n]);

    assert.equal(await stats.read.cantidad(), 2n);
    assert.equal(await stats.read.datos([0n]), 3n);
    assert.equal(await stats.read.datos([1n]), 2n);
  });

  it("ArrayLib: quitar fuera de rango revierte", async function () {
    const stats = await viem.deployContract("Estadisticas");

    await viem.assertions.revertWith(stats.write.quitar([0n]), "Indice fuera de rango");
  });
});
