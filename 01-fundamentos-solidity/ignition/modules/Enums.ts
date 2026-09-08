import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EnumsModule", (m) => {
  const enums = m.contract("Enums");

  return { enums };
});
