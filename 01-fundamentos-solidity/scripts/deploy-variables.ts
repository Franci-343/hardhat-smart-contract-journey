import { network } from "hardhat";

const { ethers } = await network.create();

const variables = await ethers.deployContract("Variables");
await variables.waitForDeployment();

console.log("Variables deployed to:", await variables.getAddress());
console.log("Owner:", await variables.owner());
console.log("Name:", await variables.name());
