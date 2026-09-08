import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MappingsModule", (m) => {
  const mappings = m.contract("Mappings");

  return { mappings };
});
