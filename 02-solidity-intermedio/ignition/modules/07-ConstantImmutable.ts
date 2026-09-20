import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ConstantImmutableModule", (m) => {
  // Fee en puntos base: 250 = 2.5%. Un immutable se fija aqui, al desplegar, y ya no cambia.
  const feeBps = m.getParameter("feeBps", 250n);

  const constantImmutable = m.contract("ConstantImmutable", [feeBps]);

  return { constantImmutable };
});
