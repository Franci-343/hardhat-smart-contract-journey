import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// TryCatch crea su propio Riesgoso dentro del constructor.
export default buildModule("TryCatchModule", (m) => {
  const tryCatch = m.contract("TryCatch");

  return { tryCatch };
});
