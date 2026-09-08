import { network } from "hardhat";

const { ethers } = await network.create();

const contractNames = [
  "HelloWorld",
  "Variables",
  "TiposDeDatos",
  "Funciones",
  "Visibilidad",
  "VisibilidadHija",
  "Condicionales",
  "Loops",
  "Arrays",
  "Mappings",
  "Structs",
  "Enums",
  "Eventos",
  "Errores",
  "RequireAssertRevert",
  "Payable",
  "ReceiveFallback",
];

for (const contractName of contractNames) {
  const contract = await ethers.deployContract(contractName);
  await contract.waitForDeployment();

  console.log(`${contractName} deployed to:`, await contract.getAddress());
}
