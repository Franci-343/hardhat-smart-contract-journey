import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EventosModule", (m) => {
  const eventos = m.contract("Eventos");

  return { eventos };
});
