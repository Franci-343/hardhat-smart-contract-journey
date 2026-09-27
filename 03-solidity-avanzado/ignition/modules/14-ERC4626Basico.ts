import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC4626BasicoModule", (m) => {
  const suministroInicial = m.getParameter("suministroInicial", 1_000_000n);

  const activo = m.contract("TokenSubyacente", [suministroInicial]);
  const bovedaVulnerable = m.contract("BovedaERC4626Vulnerable", [activo]);
  const bovedaSegura = m.contract("BovedaERC4626Segura", [activo]);

  return { activo, bovedaVulnerable, bovedaSegura };
});
