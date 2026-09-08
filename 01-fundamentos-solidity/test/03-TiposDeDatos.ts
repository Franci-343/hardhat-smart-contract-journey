import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("TiposDeDatos", function () {
  it("stores basic Solidity types", async function () {
    const [teacher] = await ethers.getSigners();
    const tipos = await ethers.deployContract("TiposDeDatos");

    expect(await tipos.completed()).to.equal(false);
    expect(await tipos.temperature()).to.equal(-5n);
    expect(await tipos.score()).to.equal(100n);
    expect(await tipos.teacher()).to.equal(teacher.address);
    expect(await tipos.title()).to.equal("Tipos de datos");
  });

  it("updates boolean, integer and unsigned integer values", async function () {
    const tipos = await ethers.deployContract("TiposDeDatos");

    await tipos.updateCompleted(true);
    await tipos.updateTemperature(-10);
    await tipos.updateScore(250);

    expect(await tipos.completed()).to.equal(true);
    expect(await tipos.temperature()).to.equal(-10n);
    expect(await tipos.score()).to.equal(250n);
  });

  it("returns several values in a tuple", async function () {
    const tipos = await ethers.deployContract("TiposDeDatos");
    const values = await tipos.getExampleTuple();

    expect(values[0]).to.equal(false);
    expect(values[1]).to.equal(-5n);
    expect(values[2]).to.equal(100n);
    expect(values[5]).to.equal("Tipos de datos");
  });
});
