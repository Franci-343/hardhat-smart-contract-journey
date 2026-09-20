import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("OwnablePausableModule", (m) => {
  const bovedaSegura = m.contract("BovedaSegura");

  return { bovedaSegura };
});
