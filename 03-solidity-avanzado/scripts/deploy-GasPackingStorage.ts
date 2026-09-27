import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const contrato = await viem.deployContract("GasPackingStorage");
console.log("GasPackingStorage desplegado en:", contrato.address);

const gasDesordenado = await publicClient.estimateContractGas({
  address: contrato.address,
  abi: contrato.abi,
  functionName: "agregarDesordenado",
  args: [1n, 2n, 3n, 4n, true],
});
const gasEmpacado = await publicClient.estimateContractGas({
  address: contrato.address,
  abi: contrato.abi,
  functionName: "agregarEmpacado",
  args: [1n, 2n, 3n, 4n, true],
});

console.log("Gas de agregarDesordenado (4 slots):", gasDesordenado.toString());
console.log("Gas de agregarEmpacado (3 slots):    ", gasEmpacado.toString());
console.log("Diferencia:", (gasDesordenado - gasEmpacado).toString());
