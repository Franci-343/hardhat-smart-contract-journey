import { network } from "hardhat";

const { viem } = await network.create();

const tryCatch = await viem.deployContract("TryCatch");

console.log("TryCatch desplegado en:", tryCatch.address);
console.log("Riesgoso (creado por TryCatch):", await tryCatch.read.riesgoso());

const [exito, codigo] = await tryCatch.read.probarDivision([10n, 0n]);
console.log(`Dividir 10 / 0 -> exito=${exito}, codigo de Panic=0x${codigo.toString(16)}`);

const [exitoRequire, razon] = await tryCatch.read.probarRequire([0n]);
console.log(`exigirPositivo(0) -> exito=${exitoRequire}, razon="${razon}"`);
