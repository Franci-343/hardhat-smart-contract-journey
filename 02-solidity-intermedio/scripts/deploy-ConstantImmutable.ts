import { network } from "hardhat";

const { viem } = await network.create();

// El fee (250 = 2.5%) queda fijo en el bytecode: no se puede cambiar despues.
const contrato = await viem.deployContract("ConstantImmutable", [250n]);

console.log("ConstantImmutable desplegado en:", contrato.address);
console.log("MAX_SUPPLY (constant):", await contrato.read.MAX_SUPPLY());
console.log("OWNER (immutable):", await contrato.read.OWNER());
console.log("FEE_BPS (immutable):", await contrato.read.FEE_BPS());
console.log("Fee sobre 10000:", await contrato.read.calcularFeeConImmutable([10_000n]));
