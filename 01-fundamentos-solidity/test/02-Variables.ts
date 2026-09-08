import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Variables", function () {
  it("sets initial values", async function () {
    const [owner] = await ethers.getSigners();
    const variables = await ethers.deployContract("Variables");

    expect(await variables.name()).to.equal("Curso Solidity");
    expect(await variables.totalStudents()).to.equal(0n);
    expect(await variables.isActive()).to.equal(true);
    expect(await variables.owner()).to.equal(owner.address);
  });

  it("updates state variables", async function () {
    const variables = await ethers.deployContract("Variables");

    await variables.registerStudent();
    await variables.updateName("Fundamentos Web3");
    await variables.deactivate();

    expect(await variables.totalStudents()).to.equal(1n);
    expect(await variables.name()).to.equal("Fundamentos Web3");
    expect(await variables.isActive()).to.equal(false);
  });

  it("reads msg.sender from a view function", async function () {
    const [owner, student] = await ethers.getSigners();
    const variables = await ethers.deployContract("Variables");

    expect(await variables.senderAddress()).to.equal(owner.address);
    expect(await variables.connect(student).senderAddress()).to.equal(student.address);
  });
});
