import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Los argumentos del constructor se pueden cambiar con un archivo de parametros:
//   npx hardhat ignition deploy ignition/modules/02-ConstructoresHerencia.ts --parameters params.json
export default buildModule("ConstructoresHerenciaModule", (m) => {
  const nombre = m.getParameter("nombre", "Ana Perez");
  const edad = m.getParameter("edad", 40n);
  const salario = m.getParameter("salario", 5000n);
  const area = m.getParameter("area", "Tecnologia");

  const persona = m.contract("Persona", [nombre, edad]);
  const empleado = m.contract("Empleado", [nombre, edad, salario]);
  const gerente = m.contract("Gerente", [nombre, edad, salario, area]);

  return { persona, empleado, gerente };
});
