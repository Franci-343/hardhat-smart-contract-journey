import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("HelloWorld", function () {
  it("starts with the initial message", async function () {
    const helloWorld = await ethers.deployContract("HelloWorld");

    expect(await helloWorld.message()).to.equal("Hola, Solidity");
  });

  it("updates the message", async function () {
    const helloWorld = await ethers.deployContract("HelloWorld");

    await helloWorld.setMessage("Aprendiendo Hardhat");

    expect(await helloWorld.message()).to.equal("Aprendiendo Hardhat");
  });
});
