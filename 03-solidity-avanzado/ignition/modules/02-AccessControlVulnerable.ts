import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AccessControlVulnerableModule", (m) => {
  const cofreSeguro = m.contract("CofrePremiosSeguro", [], { value: 0n });
  const bancoSeguro = m.contract("BancoSeguro", [], { value: 0n });

  return { cofreSeguro, bancoSeguro };
});
