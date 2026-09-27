import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClonesCreate2Module", (m) => {
  const plantilla = m.contract("PlantillaContador");
  const fabrica = m.contract("FabricaClones");

  return { plantilla, fabrica };
});
