import { network } from "hardhat";

const { viem } = await network.create();

const [deployer] = await viem.getWalletClients();
const contrato = await viem.deployContract("ControlDeAcceso");

const adminRole = await contrato.read.ADMIN_ROLE();

console.log("ControlDeAcceso desplegado en:", contrato.address);
console.log("ADMIN_ROLE:", adminRole);
console.log("MINTER_ROLE:", await contrato.read.MINTER_ROLE());
console.log("EDITOR_ROLE:", await contrato.read.EDITOR_ROLE());
console.log("El desplegador es admin:", await contrato.read.tieneRol([adminRole, deployer.account.address]));
