import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AritmeticaUncheckedModule", (m) => {
  const aritmeticaUnchecked = m.contract("AritmeticaUnchecked");

  return { aritmeticaUnchecked };
});
