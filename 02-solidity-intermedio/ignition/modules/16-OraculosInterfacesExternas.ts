import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Este modulo despliega un oraculo FALSO (mock) y un consumidor que lo usa.
// Sirve para red local. Para Sepolia con el feed real de Chainlink usa
// scripts/deploy-OraculosInterfacesExternas.ts.
export default buildModule("OraculosInterfacesExternasModule", (m) => {
  // 8 decimales y 2000 USD por ETH, igual que un feed real de Chainlink.
  const decimales = m.getParameter("decimales", 8);
  const precioInicial = m.getParameter("precioInicial", 2000n * 10n ** 8n);
  const maxAntiguedad = m.getParameter("maxAntiguedad", 3600n);

  const oraculo = m.contract("AggregatorMock", [decimales, precioInicial]);
  const consumidor = m.contract("ConsumidorPrecio", [oraculo, maxAntiguedad]);

  return { oraculo, consumidor };
});
