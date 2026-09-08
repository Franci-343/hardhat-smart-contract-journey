import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Payable", function () {
  it("receives ETH through deposit", async function () {
    const [user] = await ethers.getSigners();
    const payableContract = await ethers.deployContract("Payable");
    const amount = ethers.parseEther("1");

    await expect(payableContract.deposit({ value: amount }))
      .to.emit(payableContract, "Deposited")
      .withArgs(user.address, amount);

    expect(await payableContract.deposits(user.address)).to.equal(amount);
    expect(await payableContract.contractBalance()).to.equal(amount);
  });

  it("receives ETH through receive", async function () {
    const [user] = await ethers.getSigners();
    const payableContract = await ethers.deployContract("Payable");
    const amount = 100n;

    await user.sendTransaction({
      to: await payableContract.getAddress(),
      value: amount,
    });

    expect(await payableContract.deposits(user.address)).to.equal(amount);
  });

  it("only lets the owner withdraw", async function () {
    const [owner, other] = await ethers.getSigners();
    const payableContract = await ethers.deployContract("Payable");

    await payableContract.deposit({ value: 1000n });

    await expect(payableContract.connect(other).withdraw(1)).to.be.revertedWith("Only owner");

    await expect(payableContract.withdraw(500n))
      .to.emit(payableContract, "Withdrawn")
      .withArgs(owner.address, 500n);

    expect(await payableContract.contractBalance()).to.equal(500n);
  });
});
