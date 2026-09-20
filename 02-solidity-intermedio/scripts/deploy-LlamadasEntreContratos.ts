import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const contador = await viem.deployContract("Contador");
const llamador = await viem.deployContract("Llamador", [contador.address]);

console.log("Contador desplegado en:", contador.address);
console.log("Llamador desplegado en:", llamador.address);

const hash = await llamador.write.incrementarRemoto();
await publicClient.waitForTransactionReceipt({ hash });

console.log("Valor del contador:", await contador.read.valor());
console.log("msg.sender que vio Contador:", await contador.read.ultimoSender());
console.log("tx.origin que vio Contador:", await contador.read.ultimoOrigen());
