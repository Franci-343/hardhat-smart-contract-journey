import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AssemblyYulModule", (m) => {
  const assemblyYul = m.contract("AssemblyYul");

  return { assemblyYul };
});
