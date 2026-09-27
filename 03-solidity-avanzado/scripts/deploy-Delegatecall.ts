import { network } from "hardhat";

const { viem } = await network.create();

const logica = await viem.deployContract("LogicaContador");
const proxyBueno = await viem.deployContract("ProxyBueno");
const proxyMalo = await viem.deployContract("ProxyMalo");

console.log("LogicaContador desplegada en:", logica.address);
console.log("ProxyBueno desplegado en:", proxyBueno.address);
console.log("ProxyMalo desplegado en:", proxyMalo.address);

await proxyBueno.write.incrementar([logica.address]);
await proxyBueno.write.incrementar([logica.address]);
console.log("ProxyBueno.contador tras 2 incrementos delegados:", await proxyBueno.read.contador());

await proxyMalo.write.incrementar([logica.address]);
console.log("ProxyMalo.contador (deberia seguir en 0, el bug escribio owner):", await proxyMalo.read.contador());
console.log("ProxyMalo.owner (corrompido):", await proxyMalo.read.owner());
