import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const contrato = await viem.deployContract("StorageLayout");
console.log("StorageLayout desplegado en:", contrato.address);

const [owner] = await viem.getWalletClients();
await contrato.write.fijarValores([owner.account.address, 222n]);

const slot0 = await publicClient.getStorageAt({ address: contrato.address, slot: "0x0" });
const slot1 = await publicClient.getStorageAt({ address: contrato.address, slot: "0x1" });

console.log("slot 0 (valorPadre):", slot0);
console.log("slot 1 (duenoPadre + activo, empacados):", slot1);
