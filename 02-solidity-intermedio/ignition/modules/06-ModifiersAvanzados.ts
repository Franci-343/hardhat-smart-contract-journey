import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ModifiersAvanzadosModule", (m) => {
  const modifiersAvanzados = m.contract("ModifiersAvanzados");

  return { modifiersAvanzados };
});
