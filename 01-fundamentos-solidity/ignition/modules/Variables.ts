import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VariablesModule", (m) => {
  const variables = m.contract("Variables");

  return { variables };
});
