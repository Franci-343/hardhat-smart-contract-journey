import { network } from "hardhat";
import { keccak256, toHex } from "viem";

const { viem } = await network.create();

const plantilla = await viem.deployContract("PlantillaContador");
const fabrica = await viem.deployContract("FabricaClones");

console.log("PlantillaContador desplegada en:", plantilla.address);
console.log("FabricaClones desplegada en:", fabrica.address);

const salt = keccak256(toHex("mi-primer-clon"));
const predicho = await fabrica.read.calcularDireccion([plantilla.address, salt]);
console.log("Direccion predicha para el clon:", predicho);

await fabrica.write.clonarDeterministico([plantilla.address, salt]);
console.log("Clon desplegado. Coincide con lo predicho.");

const clon = await viem.getContractAt("PlantillaContador", predicho);
const [owner] = await viem.getWalletClients();
await clon.write.inicializar([owner.account.address]);
await clon.write.incrementar();

console.log("Contador del clon:", await clon.read.contador());
console.log("Contador de la plantilla original (no deberia haber cambiado):", await plantilla.read.contador());
