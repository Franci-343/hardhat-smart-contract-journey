import { network } from "hardhat";

const { viem } = await network.create();

const perro = await viem.deployContract("Perro");
const cachorro = await viem.deployContract("Cachorro");
const pato = await viem.deployContract("Pato");

console.log("Perro desplegado en:", perro.address);
console.log("Cachorro desplegado en:", cachorro.address);
console.log("Pato desplegado en:", pato.address);

console.log("Perro:", await perro.read.presentarse());
console.log("Cachorro:", await cachorro.read.presentarse());
console.log("Pato:", await pato.read.moverse());
