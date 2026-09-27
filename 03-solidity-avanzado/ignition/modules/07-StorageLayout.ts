import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StorageLayoutModule", (m) => {
  const storageLayout = m.contract("StorageLayout");

  return { storageLayout };
});
