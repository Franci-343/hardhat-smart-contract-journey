import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Arrays", function () {
  it("adds and reads numbers", async function () {
    const arrays = await ethers.deployContract("Arrays");

    await arrays.addNumber(10);
    await arrays.addNumber(20);

    expect(await arrays.length()).to.equal(2n);
    expect(await arrays.getNumber(0)).to.equal(10n);
    expect(await arrays.getNumbers()).to.deep.equal([10n, 20n]);
  });

  it("updates, removes and sums values", async function () {
    const arrays = await ethers.deployContract("Arrays");

    await arrays.addNumber(2);
    await arrays.addNumber(3);
    await arrays.updateNumber(1, 8);

    expect(await arrays.sum()).to.equal(10n);

    await arrays.removeLast();

    expect(await arrays.getNumbers()).to.deep.equal([2n]);
  });

  it("reverts for invalid operations", async function () {
    const arrays = await ethers.deployContract("Arrays");

    await expect(arrays.getNumber(0)).to.be.revertedWith("Index out of bounds");
    await expect(arrays.removeLast()).to.be.revertedWith("Array is empty");
  });
});
