import { network } from "hardhat";
import { formatEther } from "viem";

const { viem } = await network.create();

const [deployer] = await viem.getWalletClients();

// 1_000_000 tokens enteros: el contrato los convierte a 18 decimales.
const token = await viem.deployContract("ERC20Basico", ["Token Curso", "TCU", 1_000_000n]);

console.log("ERC20Basico desplegado en:", token.address);
console.log("Nombre:", await token.read.name());
console.log("Simbolo:", await token.read.symbol());
console.log("Suministro total:", formatEther(await token.read.totalSupply()), await token.read.symbol());
console.log("Saldo del desplegador:", formatEther(await token.read.balanceOf([deployer.account.address])));
