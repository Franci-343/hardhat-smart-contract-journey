import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// MathLib y ArrayLib usan funciones internal: quedan incluidas dentro de Estadisticas,
// asi que no hace falta desplegarlas ni enlazarlas por separado.
export default buildModule("LibreriasModule", (m) => {
  const estadisticas = m.contract("Estadisticas");

  return { estadisticas };
});
