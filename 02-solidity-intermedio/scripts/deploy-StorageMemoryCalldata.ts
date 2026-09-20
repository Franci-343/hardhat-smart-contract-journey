import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const contrato = await viem.deployContract("StorageMemoryCalldata");
console.log("StorageMemoryCalldata desplegado en:", contrato.address);

const hash = await contrato.write.agregarUsuario(["Ana", 10n]);
await publicClient.waitForTransactionReceipt({ hash });

console.log("Usuario 0:", await contrato.read.usuarios([0n]));
console.log("Si sumamos 5 en memory (no se guarda):", await contrato.read.sumarPuntosEnMemory([0n, 5n]));
console.log("Usuario 0 sigue igual:", await contrato.read.usuarios([0n]));
