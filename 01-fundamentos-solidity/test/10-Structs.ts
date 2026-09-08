import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Structs", function () {
  it("adds and reads a student struct", async function () {
    const structs = await ethers.deployContract("Structs");

    await structs.addStudent("Ana", 22);

    expect(await structs.totalStudents()).to.equal(1n);
    expect(await structs.getStudent(0)).to.deep.equal(["Ana", 22n, true]);
  });

  it("stores a student by sender address", async function () {
    const [, student] = await ethers.getSigners();
    const structs = await ethers.deployContract("Structs");

    await structs.connect(student).addStudent("Luis", 30);

    expect(await structs.connect(student).getMyStudent()).to.deep.equal(["Luis", 30n, true]);
  });

  it("deactivates a student", async function () {
    const structs = await ethers.deployContract("Structs");

    await structs.addStudent("Marta", 19);
    await structs.deactivateStudent(0);

    expect(await structs.getStudent(0)).to.deep.equal(["Marta", 19n, false]);
  });
});
