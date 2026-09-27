import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC1155BasicoModule", (m) => {
  const erc1155 = m.contract("ERC1155Basico");

  return { erc1155 };
});
