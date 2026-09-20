import { network } from "hardhat";

const { viem } = await network.create();

// Figura es abstracto: solo se pueden desplegar sus hijos.
const rectangulo = await viem.deployContract("Rectangulo", [10n, 5n]);
const triangulo = await viem.deployContract("Triangulo", [6n, 8n, 10n]);

console.log("Rectangulo desplegado en:", rectangulo.address);
console.log("  area:", await rectangulo.read.area(), "perimetro:", await rectangulo.read.perimetro());

console.log("Triangulo desplegado en:", triangulo.address);
console.log("  area:", await triangulo.read.area(), "perimetro:", await triangulo.read.perimetro());
