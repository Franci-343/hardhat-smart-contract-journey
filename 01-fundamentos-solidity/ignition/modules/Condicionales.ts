import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CondicionalesModule", (m) => {
  const condicionales = m.contract("Condicionales");

  return { condicionales };
});
