import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LlamadasEntreContratosModule", (m) => {
  const contador = m.contract("Contador");
  // Llamador recibe la direccion de Contador: Ignition resuelve el orden de despliegue solo.
  const llamador = m.contract("Llamador", [contador]);
  const fabricaContadores = m.contract("FabricaContadores");

  return { contador, llamador, fabricaContadores };
});
