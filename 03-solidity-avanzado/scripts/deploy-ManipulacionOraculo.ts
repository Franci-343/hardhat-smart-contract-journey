import { network } from "hardhat";

const { viem } = await network.create();

const tokenA = await viem.deployContract("TokenDePrueba", ["Token A", "TKA", 1_000_000n]);
const tokenB = await viem.deployContract("TokenDePrueba", ["Token B", "TKB", 1_000_000n]);

const pool = await viem.deployContract("PoolSimple", [tokenA.address, tokenB.address]);
await tokenA.write.approve([pool.address, 10_000n]);
await tokenB.write.approve([pool.address, 10_000n]);
await pool.write.agregarLiquidez([10_000n, 10_000n]);

const proveedor = await viem.deployContract("ProveedorFlashLoan", [tokenB.address]);
await tokenB.write.approve([proveedor.address, 50_000n]);
await proveedor.write.fondear([50_000n]);

const consumidor = await viem.deployContract("ConsumidorOraculoVulnerable", [pool.address, tokenA.address, tokenB.address]);
await tokenB.write.approve([consumidor.address, 50_000n]);
await consumidor.write.fondear([50_000n]);

const atacante = await viem.deployContract("AtacanteFlashLoan", [
  proveedor.address,
  pool.address,
  consumidor.address,
  tokenA.address,
  tokenB.address,
]);

console.log("Pool desplegada en:", pool.address, "- precio spot inicial:", await pool.read.precioSpotAenB());

await atacante.write.atacar([5_000n]);

console.log("Precio spot despues del ataque:", await pool.read.precioSpotAenB());
console.log("Ganancia del atacante (en tokenB), sin haber puesto capital propio:", await atacante.read.gananciaEnB());
