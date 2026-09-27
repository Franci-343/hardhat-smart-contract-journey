import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChecklistAuditoriaModule", (m) => {
  const precioInicial = m.getParameter("precioInicial", 2000n * 10n ** 18n);

  const oraculo = m.contract("OraculoDePruebaAuditoria", [precioInicial]);
  const contratoParaAuditar = m.contract("ContratoParaAuditar", [oraculo]);

  return { oraculo, contratoParaAuditar };
});
