import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("02 - Constructores y super", async function () {
  const { viem } = await network.create();

  it("Empleado pasa los argumentos al constructor de Persona", async function () {
    const empleado = await viem.deployContract("Empleado", ["Ana", 30n, 2500n]);

    assert.equal(await empleado.read.nombre(), "Ana");
    assert.equal(await empleado.read.edad(), 30n);
    assert.equal(await empleado.read.salario(), 2500n);
  });

  it("Gerente recorre toda la cadena de constructores", async function () {
    const gerente = await viem.deployContract("Gerente", ["Luis", 45n, 9000n, "Ventas"]);

    assert.equal(await gerente.read.nombre(), "Luis");
    assert.equal(await gerente.read.edad(), 45n);
    assert.equal(await gerente.read.salario(), 9000n);
    assert.equal(await gerente.read.area(), "Ventas");
  });

  it("los constructores se ejecutan del mas base al mas derivado", async function () {
    const gerente = await viem.deployContract("Gerente", ["Luis", 45n, 9000n, "Ventas"]);

    assert.deepEqual(await gerente.read.ordenConstruccion(), ["Persona", "Empleado", "Gerente"]);
  });

  it("super encadena las versiones del padre en presentarse()", async function () {
    const persona = await viem.deployContract("Persona", ["Eva", 20n]);
    const empleado = await viem.deployContract("Empleado", ["Ana", 30n, 2500n]);
    const gerente = await viem.deployContract("Gerente", ["Luis", 45n, 9000n, "Ventas"]);

    assert.equal(await persona.read.presentarse(), "Eva");
    assert.equal(await empleado.read.presentarse(), "Ana (empleado)");
    assert.equal(await gerente.read.presentarse(), "Luis (empleado) de Ventas");
  });
});
