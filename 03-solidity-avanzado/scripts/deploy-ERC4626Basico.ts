import { network } from "hardhat";

const { viem } = await network.create();
const [owner] = await viem.getWalletClients();

const activo = await viem.deployContract("TokenSubyacente", [1_000_000n]);
const boveda = await viem.deployContract("BovedaERC4626Segura", [activo.address]);

console.log("TokenSubyacente desplegado en:", activo.address);
console.log("BovedaERC4626Segura desplegada en:", boveda.address);

await activo.write.approve([boveda.address, 2_000n]);
await boveda.write.deposit([2_000n, owner.account.address]);

console.log("Acciones recibidas:", await boveda.read.balanceOf([owner.account.address]));
console.log("Activo total en la boveda:", await boveda.read.totalAssets());
