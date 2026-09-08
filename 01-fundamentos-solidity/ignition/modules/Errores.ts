import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ErroresModule", (m) => {
  const errores = m.contract("Errores");

  return { errores };
});
