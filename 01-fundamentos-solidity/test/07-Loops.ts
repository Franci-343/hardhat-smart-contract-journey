import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Loops", function () {
  it("sums numbers from one to a limit", async function () {
    const loops = await ethers.deployContract("Loops");

    expect(await loops.sumUntil(5)).to.equal(15n);
    expect(await loops.sumUntil(0)).to.equal(0n);
  });

  it("counts even numbers using while", async function () {
    const loops = await ethers.deployContract("Loops");

    expect(await loops.countEven(6)).to.equal(4n);
  });

  it("finds the first multiple of five", async function () {
    const loops = await ethers.deployContract("Loops");

    expect(await loops.firstMultipleOfFive([3, 7, 10, 15])).to.equal(10n);
    expect(await loops.firstMultipleOfFive([1, 2, 3])).to.equal(0n);
  });
});
