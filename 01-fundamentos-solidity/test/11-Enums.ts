import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Enums", function () {
  it("starts pending and moves through valid states", async function () {
    const enums = await ethers.deployContract("Enums");

    expect(await enums.status()).to.equal(0n);
    expect(await enums.getStatusName()).to.equal("Pending");

    await enums.activate();
    expect(await enums.status()).to.equal(1n);
    expect(await enums.getStatusName()).to.equal("Active");

    await enums.complete();
    expect(await enums.status()).to.equal(2n);
    expect(await enums.getStatusName()).to.equal("Completed");
  });

  it("cancels before completion", async function () {
    const enums = await ethers.deployContract("Enums");

    await enums.cancel();

    expect(await enums.status()).to.equal(3n);
    expect(await enums.getStatusName()).to.equal("Cancelled");
  });

  it("rejects invalid transitions", async function () {
    const enums = await ethers.deployContract("Enums");

    await expect(enums.complete()).to.be.revertedWith("Only active can complete");
  });
});
