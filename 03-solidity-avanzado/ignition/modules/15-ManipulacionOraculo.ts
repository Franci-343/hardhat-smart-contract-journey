import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ManipulacionOraculoModule", (m) => {
  const suministro = m.getParameter("suministro", 1_000_000n);

  const tokenA = m.contract("TokenDePrueba", ["Token A", "TKA", suministro], { id: "TokenA" });
  const tokenB = m.contract("TokenDePrueba", ["Token B", "TKB", suministro], { id: "TokenB" });

  const pool = m.contract("PoolSimple", [tokenA, tokenB]);
  const proveedorFlashLoan = m.contract("ProveedorFlashLoan", [tokenB]);
  const consumidorVulnerable = m.contract("ConsumidorOraculoVulnerable", [pool, tokenA, tokenB]);
  const consumidorSeguro = m.contract("ConsumidorOraculoSeguro", [tokenA, tokenB, 10n ** 18n]);

  return { tokenA, tokenB, pool, proveedorFlashLoan, consumidorVulnerable, consumidorSeguro };
});
