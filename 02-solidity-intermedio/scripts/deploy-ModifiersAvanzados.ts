import { network } from "hardhat";

const { viem } = await network.create();

const contrato = await viem.deployContract("ModifiersAvanzados");

console.log("ModifiersAvanzados desplegado en:", contrato.address);
console.log("Owner:", await contrato.read.owner());
console.log("Cooldown (segundos):", await contrato.read.COOLDOWN());
