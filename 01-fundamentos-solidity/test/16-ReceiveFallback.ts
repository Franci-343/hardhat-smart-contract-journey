import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("ReceiveFallback", function () {
  it("calls receive when ETH is sent without data", async function () {
    const [user] = await ethers.getSigners();
    const receiveFallback = await ethers.deployContract("ReceiveFallback");

    await expect(
      user.sendTransaction({
        to: await receiveFallback.getAddress(),
        value: 100n,
      }),
    )
      .to.emit(receiveFallback, "Received")
      .withArgs(user.address, 100n);

    expect(await receiveFallback.receiveCount()).to.equal(1n);
    expect(await receiveFallback.fallbackCount()).to.equal(0n);
    expect(await receiveFallback.totalReceived()).to.equal(100n);
  });

  it("calls fallback when unknown calldata is sent", async function () {
    const [user] = await ethers.getSigners();
    const receiveFallback = await ethers.deployContract("ReceiveFallback");

    await expect(
      user.sendTransaction({
        to: await receiveFallback.getAddress(),
        value: 50n,
        data: "0x12345678",
      }),
    )
      .to.emit(receiveFallback, "FallbackCalled")
      .withArgs(user.address, 50n, "0x12345678");

    expect(await receiveFallback.receiveCount()).to.equal(0n);
    expect(await receiveFallback.fallbackCount()).to.equal(1n);
    expect(await receiveFallback.totalReceived()).to.equal(50n);
    expect(await receiveFallback.lastData()).to.equal("0x12345678");
  });
});
