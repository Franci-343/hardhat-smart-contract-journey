import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Visibilidad", function () {
  it("allows public and external functions to be called", async function () {
    const visibilidad = await ethers.deployContract("Visibilidad");

    expect(await visibilidad.publicNumber()).to.equal(1n);
    expect(await visibilidad.publicFunction()).to.equal("public");
    expect(await visibilidad.externalFunction()).to.equal("external");
  });

  it("reads private data through an allowed public function", async function () {
    const visibilidad = await ethers.deployContract("Visibilidad");

    expect(await visibilidad.getPrivateNumber()).to.equal(2n);
    expect(await visibilidad.callPrivateFunction()).to.equal("private");
  });

  it("allows a child contract to read internal state", async function () {
    const child = await ethers.deployContract("VisibilidadHija");

    expect(await child.readInternalNumber()).to.equal(3n);
  });
});
