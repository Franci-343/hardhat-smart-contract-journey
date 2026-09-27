import { network } from "hardhat";
import { maxUint256 } from "viem";

const { viem } = await network.create();

const contrato = await viem.deployContract("AritmeticaUnchecked");

console.log("AritmeticaUnchecked desplegado en:", contrato.address);

await contrato.write.depositar({ value: 10n });
await contrato.write.retirarSinCheckVulnerable([11n]);

const [owner] = await viem.getWalletClients();
const balanceCorrupto = await contrato.read.balances([owner.account.address]);

console.log("Deposite 10, retire 11 sin proteccion. Balance resultante:", balanceCorrupto.toString());
console.log("Es type(uint256).max?", balanceCorrupto === maxUint256);
console.log("300 truncado a uint8:", await contrato.read.truncarAUint8([300n]));
