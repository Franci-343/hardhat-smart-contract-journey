import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC20BasicoModule", (m) => {
  const nombre = m.getParameter("nombre", "Token Curso");
  const simbolo = m.getParameter("simbolo", "TCU");
  // En tokens enteros: el contrato lo multiplica por 10 ** 18.
  const suministroInicial = m.getParameter("suministroInicial", 1_000_000n);

  const token = m.contract("ERC20Basico", [nombre, simbolo, suministroInicial]);

  return { token };
});
