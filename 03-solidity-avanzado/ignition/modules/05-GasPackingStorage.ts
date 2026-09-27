import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GasPackingStorageModule", (m) => {
  const gasPackingStorage = m.contract("GasPackingStorage");

  return { gasPackingStorage };
});
