import { network } from "hardhat";

const { ethers } = await network.create();

const tiposDeDatos = await ethers.deployContract("TiposDeDatos");
await tiposDeDatos.waitForDeployment();

console.log("TiposDeDatos deployed to:", await tiposDeDatos.getAddress());
console.log("Title:", await tiposDeDatos.title());
console.log("Teacher:", await tiposDeDatos.teacher());
