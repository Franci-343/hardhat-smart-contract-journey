import { network } from "hardhat";
import { createWalletClient, custom, formatEther, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();
const [owner] = await viem.getWalletClients();

// La "victima" es una cuenta nueva, generada y fondeada en el momento. Esto
// hace que el script funcione igual en local y en Sepolia, usando una sola
// clave privada configurada (la de `owner`): no hace falta una segunda
// cuenta ya configurada en hardhat.config.ts.
const victima = createWalletClient({
  account: privateKeyToAccount(generatePrivateKey()),
  chain: publicClient.chain,
  transport: custom(publicClient.transport),
});

// Montos chicos a proposito (la leccion no depende del monto): alcanza con
// lo que da un solo faucet de Sepolia.
const DEPOSITO_VICTIMA = parseEther("0.05");
const DEPOSITO_ATACANTE = parseEther("0.01");

const hashFondeo = await owner.sendTransaction({
  to: victima.account.address,
  value: DEPOSITO_VICTIMA + parseEther("0.005"), // un poco extra para el gas de la victima
});
await publicClient.waitForTransactionReceipt({ hash: hashFondeo });

const boveda = await viem.deployContract("BovedaVulnerable");
const atacante = await viem.deployContract("AtacanteReentradaSimple", [boveda.address]);

console.log("BovedaVulnerable desplegada en:", boveda.address);
console.log("AtacanteReentradaSimple desplegado en:", atacante.address);

const hashDeposito = await boveda.write.depositar({ value: DEPOSITO_VICTIMA, account: victima.account });
await publicClient.waitForTransactionReceipt({ hash: hashDeposito });
console.log("Una victima deposito", formatEther(DEPOSITO_VICTIMA), "ETH de buena fe.");

const hashAtaque = await atacante.write.atacar({ value: DEPOSITO_ATACANTE });
await publicClient.waitForTransactionReceipt({ hash: hashAtaque });

console.log("El atacante deposito solo", formatEther(DEPOSITO_ATACANTE), "ETH y ataco.");
console.log(
  "Balance final del atacante:",
  formatEther(await publicClient.getBalance({ address: atacante.address })),
  "ETH",
);
console.log("Balance final de la boveda:", formatEther(await boveda.read.contractBalance()), "ETH");
