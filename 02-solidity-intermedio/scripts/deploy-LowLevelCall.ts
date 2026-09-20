import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const objetivo = await viem.deployContract("ObjetivoBajoNivel");
const llamador = await viem.deployContract("LlamadorBajoNivel");

console.log("ObjetivoBajoNivel desplegado en:", objetivo.address);
console.log("LlamadorBajoNivel desplegado en:", llamador.address);

const hash = await llamador.write.llamarConEncodeCall([objetivo.address, 42n]);
await publicClient.waitForTransactionReceipt({ hash });

console.log("numero guardado por la llamada de bajo nivel:", await objetivo.read.numero());
console.log("lectura con staticcall:", await llamador.read.leerConStaticcall([objetivo.address]));
console.log("selector de establecer(uint256):", await llamador.read.selectorDeEstablecer());
