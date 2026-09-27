import { network } from "hardhat";

const { viem } = await network.create();

const v1 = await viem.deployContract("ImplementacionV1");
const proxy = await viem.deployContract("ProxyMinimo", [v1.address]);

console.log("ImplementacionV1 desplegada en:", v1.address);
console.log("ProxyMinimo desplegado en:", proxy.address);
console.log("Implementacion registrada en el proxy:", await proxy.read.implementacion());

const proxyComoV1 = await viem.getContractAt("ImplementacionV1", proxy.address);
await proxyComoV1.write.establecer([42n]);
console.log("Valor a traves del proxy:", await proxyComoV1.read.valor());
