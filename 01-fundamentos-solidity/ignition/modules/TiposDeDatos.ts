import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TiposDeDatosModule", (m) => {
  const tiposDeDatos = m.contract("TiposDeDatos");

  return { tiposDeDatos };
});
