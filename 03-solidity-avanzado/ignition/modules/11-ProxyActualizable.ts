import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProxyActualizableModule", (m) => {
  const ownerInicial = m.getAccount(0);

  const logicaV1 = m.contract("LogicaUUPS_V1");
  const datosInicializacion = m.encodeFunctionCall(logicaV1, "initialize", [ownerInicial]);
  const proxy = m.contract("ProxyUUPS", [logicaV1, datosInicializacion]);

  return { logicaV1, proxy };
});
