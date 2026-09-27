import { network } from "hardhat";

const { viem } = await network.create();

const contrato = await viem.deployContract("AssemblyYul");
console.log("AssemblyYul desplegado en:", contrato.address);

console.log("leerConAssembly():", await contrato.read.leerConAssembly());
console.log("sumarConAssembly([1,2,3,4,5]):", await contrato.read.sumarConAssembly([[1n, 2n, 3n, 4n, 5n]]));

const [owner] = await viem.getWalletClients();
console.log("esContratoConAssembly(este contrato):", await contrato.read.esContratoConAssembly([contrato.address]));
console.log("esContratoConAssembly(una EOA):", await contrato.read.esContratoConAssembly([owner.account.address]));
