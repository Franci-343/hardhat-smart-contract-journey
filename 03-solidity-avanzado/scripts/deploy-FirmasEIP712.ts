import { network } from "hardhat";
import { createWalletClient, custom, hexToSignature, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

// El firmante es la cuenta configurada para esta red (la unica que
// necesita ETH real para pagar gas EN OTRAS operaciones; firmar un mensaje
// EIP-712 no gasta gas). "destino" y "relayer" son cuentas nuevas,
// generadas y fondeadas en el momento, para que el script funcione igual
// en local y en Sepolia con una sola clave privada configurada.
const [firmante] = await viem.getWalletClients();

async function cuentaNueva() {
  return createWalletClient({
    account: privateKeyToAccount(generatePrivateKey()),
    chain: publicClient.chain,
    transport: custom(publicClient.transport),
  });
}

const destino = await cuentaNueva();
const relayer = await cuentaNueva();

// El relayer necesita ETH para pagar el gas de ejecutar la firma; destino
// no necesita nada porque solo va a RECIBIR. Montos chicos a proposito:
// alcanza con lo que da un solo faucet de Sepolia.
const hashFondeo = await firmante.sendTransaction({ to: relayer.account.address, value: parseEther("0.01") });
await publicClient.waitForTransactionReceipt({ hash: hashFondeo });

const contrato = await viem.deployContract("FirmasEIP712");
console.log("FirmasEIP712 desplegado en:", contrato.address);

await contrato.write.depositar({ value: parseEther("0.02"), account: firmante.account });

const plazo = BigInt(Math.floor(Date.now() / 1000) + 3600);
const firma = await firmante.signTypedData({
  domain: {
    name: "Curso Solidity Avanzado",
    version: "1",
    chainId: await publicClient.getChainId(),
    verifyingContract: contrato.address,
  },
  types: {
    Autorizacion: [
      { name: "destino", type: "address" },
      { name: "monto", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "plazo", type: "uint256" },
    ],
  },
  primaryType: "Autorizacion",
  message: { destino: destino.account.address, monto: parseEther("0.01"), nonce: 0n, plazo },
});

const { r, s, v } = hexToSignature(firma);

console.log("El firmante nunca envia una transaccion: firmar un mensaje no gasta gas.");
console.log("Quien realmente paga el gas y envia la transaccion es el relayer:", relayer.account.address);

const hashEjecucion = await contrato.write.ejecutarConFirma(
  [firmante.account.address, destino.account.address, parseEther("0.01"), 0n, plazo, Number(v), r, s],
  { account: relayer.account },
);
await publicClient.waitForTransactionReceipt({ hash: hashEjecucion });

console.log("Saldo del firmante:", await contrato.read.saldos([firmante.account.address]));
console.log("Saldo del destino:", await contrato.read.saldos([destino.account.address]));
