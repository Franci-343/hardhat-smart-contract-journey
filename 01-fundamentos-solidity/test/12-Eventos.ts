import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Eventos", function () {
  it("emits an event when value changes", async function () {
    const [user] = await ethers.getSigners();
    const eventos = await ethers.deployContract("Eventos");

    await expect(eventos.setValue(42))
      .to.emit(eventos, "ValueChanged")
      .withArgs(user.address, 0n, 42n);

    expect(await eventos.value()).to.equal(42n);
  });

  it("emits an event when reset", async function () {
    const [user] = await ethers.getSigners();
    const eventos = await ethers.deployContract("Eventos");

    await eventos.setValue(10);

    await expect(eventos.reset()).to.emit(eventos, "Reset").withArgs(user.address);
    expect(await eventos.value()).to.equal(0n);
  });
});
