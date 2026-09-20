import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre, { network } from "hardhat";

describe("03 - Contratos abstractos", async function () {
  const { viem } = await network.create();

  it("un contrato abstracto no tiene bytecode desplegable", async function () {
    const artefacto = await hre.artifacts.readArtifact("Figura");

    assert.equal(artefacto.bytecode, "0x");
  });

  it("Rectangulo implementa area() y perimetro()", async function () {
    const rectangulo = await viem.deployContract("Rectangulo", [10n, 10n]);

    assert.equal(await rectangulo.read.nombre(), "Rectangulo");
    assert.equal(await rectangulo.read.area(), 100n);
    assert.equal(await rectangulo.read.perimetro(), 40n);
  });

  it("Triangulo implementa area() y perimetro() de otra forma", async function () {
    const triangulo = await viem.deployContract("Triangulo", [6n, 8n, 10n]);

    assert.equal(await triangulo.read.nombre(), "Triangulo");
    assert.equal(await triangulo.read.area(), 24n);
    assert.equal(await triangulo.read.perimetro(), 24n);
  });

  it("la funcion implementada en el abstracto usa las funciones de cada hijo", async function () {
    const rectangulo = await viem.deployContract("Rectangulo", [10n, 10n]);
    const triangulo = await viem.deployContract("Triangulo", [6n, 8n, 10n]);

    assert.equal(await rectangulo.read.areaSobrePerimetro(), 2n); // 100 / 40
    assert.equal(await triangulo.read.areaSobrePerimetro(), 1n); // 24 / 24
  });
});
