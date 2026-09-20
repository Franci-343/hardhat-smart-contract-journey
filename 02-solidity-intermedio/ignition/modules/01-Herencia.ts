import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("HerenciaModule", (m) => {
  const animal = m.contract("Animal");
  const perro = m.contract("Perro");
  const cachorro = m.contract("Cachorro");
  const volador = m.contract("Volador");
  const nadador = m.contract("Nadador");
  const pato = m.contract("Pato");

  return { animal, perro, cachorro, volador, nadador, pato };
});
