import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StructsModule", (m) => {
  const structs = m.contract("Structs");

  return { structs };
});
