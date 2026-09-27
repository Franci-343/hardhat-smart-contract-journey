import { network } from "hardhat";
import { encodePacked, keccak256, parseEther, toBytes } from "viem";

const { viem } = await network.create();

const RESPUESTA = "ETHEREUM";
const hashRespuesta = keccak256(toBytes(RESPUESTA));

// Monto chico a proposito: alcanza con lo que da un solo faucet de Sepolia.
const acertijo = await viem.deployContract("AcertijoCommitReveal", [hashRespuesta], { value: parseEther("0.01") });

console.log("AcertijoCommitReveal desplegado en:", acertijo.address);

const [owner] = await viem.getWalletClients();
const secreto = keccak256(toBytes("mi-secreto"));
const hashCompromiso = keccak256(
  encodePacked(["string", "bytes32", "address"], [RESPUESTA, secreto, owner.account.address]),
);

await acertijo.write.comprometer([hashCompromiso]);
console.log("Fase 1: comprometido un hash que no revela nada.");

await acertijo.write.revelar([RESPUESTA, secreto]);
console.log("Fase 2: revelado. Ganador:", await acertijo.read.ganador());
