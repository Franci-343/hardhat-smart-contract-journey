import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VisibilidadModule", (m) => {
  const visibilidad = m.contract("Visibilidad");
  const visibilidadHija = m.contract("VisibilidadHija");

  return { visibilidad, visibilidadHija };
});
