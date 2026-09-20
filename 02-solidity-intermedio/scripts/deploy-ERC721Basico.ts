import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const [deployer] = await viem.getWalletClients();
const nft = await viem.deployContract("ERC721Basico", ["Coleccion Curso", "CCU"]);

console.log("ERC721Basico desplegado en:", nft.address);

// Mintea el primer NFT (tokenId 0) a quien despliega.
const hash = await nft.write.mint([deployer.account.address, "ipfs://tu-metadata/0.json"]);
await publicClient.waitForTransactionReceipt({ hash });

console.log("Dueno del token 0:", await nft.read.ownerOf([0n]));
console.log("tokenURI del token 0:", await nft.read.tokenURI([0n]));
console.log("NFTs del desplegador:", await nft.read.balanceOf([deployer.account.address]));
