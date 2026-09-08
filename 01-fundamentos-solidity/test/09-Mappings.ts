import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Mappings", function () {
  it("registers a user and stores points", async function () {
    const [student] = await ethers.getSigners();
    const mappings = await ethers.deployContract("Mappings");

    await mappings.register();
    await mappings.depositPoints(100);

    expect(await mappings.registered(student.address)).to.equal(true);
    expect(await mappings.balances(student.address)).to.equal(100n);
  });

  it("transfers points between addresses", async function () {
    const [student, receiver] = await ethers.getSigners();
    const mappings = await ethers.deployContract("Mappings");

    await mappings.register();
    await mappings.depositPoints(100);
    await mappings.transferPoints(receiver.address, 40);

    expect(await mappings.balances(student.address)).to.equal(60n);
    expect(await mappings.balances(receiver.address)).to.equal(40n);
  });

  it("reverts when the user is not registered", async function () {
    const mappings = await ethers.deployContract("Mappings");

    await expect(mappings.depositPoints(1)).to.be.revertedWith("Not registered");
  });
});
