import { network } from "hardhat";
import { parseEther } from "viem";

const { viem } = await network.create();

// Montos chicos a proposito: la leccion no depende del monto, y asi el
// script se puede correr en Sepolia con lo que da un solo faucet.
const cofre = await viem.deployContract("CofrePremiosSeguro", [], { value: parseEther("0.01") });
const banco = await viem.deployContract("BancoSeguro", [], { value: parseEther("0.01") });

console.log("CofrePremiosSeguro desplegado en:", cofre.address);
console.log("Admin del cofre:", await cofre.read.admin());

console.log("BancoSeguro desplegado en:", banco.address);
console.log("Owner del banco:", await banco.read.owner());
console.log("Balance del banco:", await banco.read.contractBalance());
