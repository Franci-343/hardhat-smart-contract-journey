import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("RequireAssertRevert", function () {
  it("adds to total and can reset by owner", async function () {
    const requireAssertRevert = await ethers.deployContract("RequireAssertRevert");

    await requireAssertRevert.add(15);

    expect(await requireAssertRevert.total()).to.equal(15n);
    expect(await requireAssertRevert.onlyOwnerAction()).to.equal("Owner action executed");

    await requireAssertRevert.reset();

    expect(await requireAssertRevert.total()).to.equal(0n);
  });

  it("reverts with require and revert", async function () {
    const [, other] = await ethers.getSigners();
    const requireAssertRevert = await ethers.deployContract("RequireAssertRevert");

    await expect(requireAssertRevert.add(0)).to.be.revertedWith("Amount must be greater than zero");
    await expect(requireAssertRevert.connect(other).onlyOwnerAction()).to.be.revertedWith(
      "Only owner can call this function",
    );
    await expect(requireAssertRevert.connect(other).reset()).to.be.revertedWith("Only owner");
  });
});
