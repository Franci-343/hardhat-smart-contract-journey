import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Funciones", function () {
  it("increments, decrements and resets the counter", async function () {
    const funciones = await ethers.deployContract("Funciones");

    await funciones.increment();
    await funciones.increment();
    await funciones.decrement();

    expect(await funciones.getCounter()).to.equal(1n);

    await funciones.reset();

    expect(await funciones.counter()).to.equal(0n);
  });

  it("uses pure functions for math", async function () {
    const funciones = await ethers.deployContract("Funciones");

    expect(await funciones.add(2, 3)).to.equal(5n);
    expect(await funciones.multiply(4, 5)).to.equal(20n);
  });

  it("reverts when decrementing zero", async function () {
    const funciones = await ethers.deployContract("Funciones");

    await expect(funciones.decrement()).to.be.revertedWith("Counter is zero");
  });
});
