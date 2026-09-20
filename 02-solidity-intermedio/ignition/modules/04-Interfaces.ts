import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("InterfacesModule", (m) => {
  const almacenSimple = m.contract("AlmacenSimple");
  const almacenDoble = m.contract("AlmacenDoble");
  const clienteAlmacen = m.contract("ClienteAlmacen");

  return { almacenSimple, almacenDoble, clienteAlmacen };
});
