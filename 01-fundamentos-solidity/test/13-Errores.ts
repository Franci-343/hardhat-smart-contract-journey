import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Errores", function () {
  it("deposits and lets the owner withdraw", async function () {
    const errores = await ethers.deployContract("Errores");

    await errores.deposit(100);
    await errores.withdraw(40);

    expect(await errores.balance()).to.equal(60n);
  });

  it("reverts with custom errors", async function () {
    const [, other] = await ethers.getSigners();
    const errores = await ethers.deployContract("Errores");

    await expect(errores.deposit(0)).to.be.revertedWithCustomError(errores, "InvalidAmount");
    await expect(errores.connect(other).withdraw(1))
      .to.be.revertedWithCustomError(errores, "NotOwner")
      .withArgs(other.address);

    await expect(errores.withdraw(10))
      .to.be.revertedWithCustomError(errores, "InsufficientBalance")
      .withArgs(0n, 10n);
  });
});
