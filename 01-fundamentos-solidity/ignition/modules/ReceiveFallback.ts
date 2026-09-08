import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReceiveFallbackModule", (m) => {
  const receiveFallback = m.contract("ReceiveFallback");

  return { receiveFallback };
});
