import { network } from "hardhat";

const { viem } = await network.create();
const [owner] = await viem.getWalletClients();

const nft = await viem.deployContract("ERC1155Basico");
console.log("ERC1155Basico desplegado en:", nft.address);

await nft.write.mint([owner.account.address, 1n, 100n, "ipfs://oro"]);
await nft.write.mint([owner.account.address, 2n, 1n, "ipfs://espada"]);

console.log("Balance de oro (id 1):", await nft.read.balanceOf([owner.account.address, 1n]));
console.log("Balance de espada (id 2):", await nft.read.balanceOf([owner.account.address, 2n]));
console.log(
  "Balance en lote:",
  await nft.read.balanceOfBatch([[owner.account.address, owner.account.address], [1n, 2n]]),
);
