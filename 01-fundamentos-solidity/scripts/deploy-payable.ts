import { network } from "hardhat";

const { ethers } = await network.create();

const payableContract = await ethers.deployContract("Payable");
await payableContract.waitForDeployment();

console.log("Payable deployed to:", await payableContract.getAddress());
console.log("Owner:", await payableContract.owner());
console.log("Balance:", await payableContract.contractBalance());
