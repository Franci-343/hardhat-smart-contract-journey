import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReentrancyModule", (m) => {
  const bovedaVulnerable = m.contract("BovedaVulnerable");
  const atacanteSimple = m.contract("AtacanteReentradaSimple", [bovedaVulnerable]);

  const bovedaSegura = m.contract("BovedaSegura");
  const atacanteContraSegura = m.contract("AtacanteContraBovedaSegura", [bovedaSegura]);

  return { bovedaVulnerable, atacanteSimple, bovedaSegura, atacanteContraSegura };
});
