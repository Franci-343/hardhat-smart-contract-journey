import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GasPatronesModule", (m) => {
  const gasEnLoops = m.contract("GasEnLoops");
  const gasCortocircuito = m.contract("GasCortocircuito");
  const erroresConString = m.contract("ErroresConString");
  const erroresConCustomError = m.contract("ErroresConCustomError");

  return { gasEnLoops, gasCortocircuito, erroresConString, erroresConCustomError };
});
