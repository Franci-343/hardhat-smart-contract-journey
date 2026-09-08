import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ArraysModule", (m) => {
  const arrays = m.contract("Arrays");

  return { arrays };
});
