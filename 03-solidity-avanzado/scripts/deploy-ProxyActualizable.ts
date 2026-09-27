import { network } from "hardhat";
import { encodeFunctionData } from "viem";

const { viem } = await network.create();
const [owner] = await viem.getWalletClients();

const v1 = await viem.deployContract("LogicaUUPS_V1");
const datosInit = encodeFunctionData({ abi: v1.abi, functionName: "initialize", args: [owner.account.address] });
const proxy = await viem.deployContract("ProxyUUPS", [v1.address, datosInit]);

console.log("LogicaUUPS_V1 desplegada en:", v1.address);
console.log("ProxyUUPS desplegado en:", proxy.address);

const proxyComoV1 = await viem.getContractAt("LogicaUUPS_V1", proxy.address);
console.log("Owner inicializado a traves del proxy:", await proxyComoV1.read.owner());

await proxyComoV1.write.establecer([42n]);

const v2 = await viem.deployContract("LogicaUUPS_V2");
await proxyComoV1.write.upgradeTo([v2.address]);

const proxyComoV2 = await viem.getContractAt("LogicaUUPS_V2", proxy.address);
console.log("Tras actualizar a V2, valor sigue en:", await proxyComoV2.read.valor());

await proxyComoV2.write.establecerExtra([7n]);
console.log("Y ya se puede usar la funcion nueva de V2, extra =", await proxyComoV2.read.extra());
