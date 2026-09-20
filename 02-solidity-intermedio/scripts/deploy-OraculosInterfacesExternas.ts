import { network } from "hardhat";
import { formatUnits } from "viem";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const SEPOLIA_CHAIN_ID = 11155111;
// Feed ETH/USD de Chainlink en Sepolia. Verificalo siempre en la documentacion oficial de
// Chainlink (Data Feeds > Sepolia) antes de usarlo: las direcciones son datos externos.
const FEED_ETH_USD_SEPOLIA = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

const chainId = await publicClient.getChainId();
let direccionFeed: `0x${string}`;

if (chainId === SEPOLIA_CHAIN_ID) {
  console.log("Red Sepolia detectada: usando el feed real de Chainlink.");
  direccionFeed = FEED_ETH_USD_SEPOLIA;
} else {
  console.log(`Red local (chainId ${chainId}): desplegando un oraculo mock.`);
  const mock = await viem.deployContract("AggregatorMock", [8, 2000n * 10n ** 8n]);
  direccionFeed = mock.address;
}

// El precio del feed de Sepolia puede tardar hasta 1 hora entre actualizaciones: usamos 2 horas de margen.
const consumidor = await viem.deployContract("ConsumidorPrecio", [direccionFeed, 7200n]);

console.log("Feed usado:", direccionFeed);
console.log("ConsumidorPrecio desplegado en:", consumidor.address);

const precio = await consumidor.read.precioEth();
console.log("Precio de 1 ETH en USD:", formatUnits(precio, 8));
