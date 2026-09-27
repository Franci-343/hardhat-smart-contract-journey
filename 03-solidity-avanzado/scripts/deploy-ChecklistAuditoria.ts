import { network } from "hardhat";

const { viem } = await network.create();

const oraculo = await viem.deployContract("OraculoDePruebaAuditoria", [2000n * 10n ** 18n]);
const contrato = await viem.deployContract("ContratoParaAuditar", [oraculo.address]);

console.log("OraculoDePruebaAuditoria desplegado en:", oraculo.address);
console.log("ContratoParaAuditar desplegado en:", contrato.address);
console.log("Owner actual:", await contrato.read.owner());
console.log();
console.log("Este contrato tiene al menos 5 problemas de seguridad a proposito.");
console.log("Revisa la leccion 17 en docs/ antes de mirar la solucion.");
