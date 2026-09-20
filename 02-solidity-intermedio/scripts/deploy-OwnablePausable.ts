import { network } from "hardhat";

const { viem } = await network.create();

const boveda = await viem.deployContract("BovedaSegura");

console.log("BovedaSegura desplegada en:", boveda.address);
console.log("Owner:", await boveda.read.owner());
console.log("Pausada:", await boveda.read.paused());
