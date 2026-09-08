import { network } from "hardhat";

const { ethers } = await network.create();

const helloWorld = await ethers.deployContract("HelloWorld");
await helloWorld.waitForDeployment();

console.log("HelloWorld deployed to:", await helloWorld.getAddress());
console.log("Initial message:", await helloWorld.message());
