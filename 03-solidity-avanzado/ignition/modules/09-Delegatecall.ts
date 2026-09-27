import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DelegatecallModule", (m) => {
  const logica = m.contract("LogicaContador");
  const proxyMalo = m.contract("ProxyMalo");
  const proxyBueno = m.contract("ProxyBueno");

  return { logica, proxyMalo, proxyBueno };
});
