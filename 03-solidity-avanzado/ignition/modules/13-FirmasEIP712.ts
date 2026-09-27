import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FirmasEIP712Module", (m) => {
  const firmasEIP712 = m.contract("FirmasEIP712");

  return { firmasEIP712 };
});
