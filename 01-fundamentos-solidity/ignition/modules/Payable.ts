import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PayableModule", (m) => {
  const payableContract = m.contract("Payable");

  return { payableContract };
});
