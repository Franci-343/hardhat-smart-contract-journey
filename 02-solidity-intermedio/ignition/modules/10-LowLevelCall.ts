import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LowLevelCallModule", (m) => {
  const objetivoBajoNivel = m.contract("ObjetivoBajoNivel");
  const llamadorBajoNivel = m.contract("LlamadorBajoNivel");

  return { objetivoBajoNivel, llamadorBajoNivel };
});
