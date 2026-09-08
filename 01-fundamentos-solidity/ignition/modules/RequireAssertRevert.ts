import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RequireAssertRevertModule", (m) => {
  const requireAssertRevert = m.contract("RequireAssertRevert");

  return { requireAssertRevert };
});
