import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StorageMemoryCalldataModule", (m) => {
  const storageMemoryCalldata = m.contract("StorageMemoryCalldata");

  return { storageMemoryCalldata };
});
