import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Figura es abstracto: no se despliega. Solo se despliegan sus hijos.
export default buildModule("ContratosAbstractosModule", (m) => {
  const rectangulo = m.contract("Rectangulo", [m.getParameter("ancho", 10n), m.getParameter("alto", 5n)]);
  const triangulo = m.contract("Triangulo", [
    m.getParameter("base", 6n),
    m.getParameter("altura", 8n),
    m.getParameter("hipotenusa", 10n),
  ]);

  return { rectangulo, triangulo };
});
