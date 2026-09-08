import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FuncionesModule", (m) => {
  const funciones = m.contract("Funciones");

  return { funciones };
});
