import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC721BasicoModule", (m) => {
  const nombre = m.getParameter("nombre", "Coleccion Curso");
  const simbolo = m.getParameter("simbolo", "CCU");

  const nft = m.contract("ERC721Basico", [nombre, simbolo]);

  return { nft };
});
