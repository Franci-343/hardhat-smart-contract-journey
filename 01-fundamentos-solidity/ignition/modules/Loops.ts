import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LoopsModule", (m) => {
  const loops = m.contract("Loops");

  return { loops };
});
