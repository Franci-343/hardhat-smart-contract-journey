import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProxyMinimoModule", (m) => {
  const implementacionV1 = m.contract("ImplementacionV1");
  const proxy = m.contract("ProxyMinimo", [implementacionV1]);

  return { implementacionV1, proxy };
});
