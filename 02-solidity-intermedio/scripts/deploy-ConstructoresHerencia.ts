import { network } from "hardhat";

const { viem } = await network.create();

const gerente = await viem.deployContract("Gerente", ["Ana Perez", 40n, 5000n, "Tecnologia"]);

console.log("Gerente desplegado en:", gerente.address);
console.log("Presentacion:", await gerente.read.presentarse());
console.log("Orden de construccion:", await gerente.read.ordenConstruccion());
