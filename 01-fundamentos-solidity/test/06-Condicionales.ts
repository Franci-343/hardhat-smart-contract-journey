import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Condicionales", function () {
  it("checks if an age is adult", async function () {
    const condicionales = await ethers.deployContract("Condicionales");

    expect(await condicionales.isAdult(17)).to.equal(false);
    expect(await condicionales.isAdult(18)).to.equal(true);
  });

  it("returns grades based on score", async function () {
    const condicionales = await ethers.deployContract("Condicionales");

    expect(await condicionales.grade(95)).to.equal("A");
    expect(await condicionales.grade(80)).to.equal("B");
    expect(await condicionales.grade(60)).to.equal("C");
    expect(await condicionales.grade(10)).to.equal("F");
  });

  it("uses boolean logic and ternary expressions", async function () {
    const condicionales = await ethers.deployContract("Condicionales");

    expect(await condicionales.max(10, 4)).to.equal(10n);
    expect(await condicionales.canWithdraw(100, 25)).to.equal(true);
    expect(await condicionales.canWithdraw(10, 25)).to.equal(false);
  });
});
