import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AccessControlModule", (m) => {
  const controlDeAcceso = m.contract("ControlDeAcceso");

  return { controlDeAcceso };
});
