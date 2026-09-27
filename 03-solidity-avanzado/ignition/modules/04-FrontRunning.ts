import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toBytes } from "viem";

// Hash de la respuesta "ETHEREUM", calculado en tiempo de compilacion del
// modulo (no en la cadena): asi el contrato nunca ve la respuesta en claro
// hasta que alguien la revela.
const HASH_RESPUESTA = keccak256(toBytes("ETHEREUM"));

export default buildModule("FrontRunningModule", (m) => {
  const hashRespuesta = m.getParameter("hashRespuesta", HASH_RESPUESTA);

  const acertijoVulnerable = m.contract("AcertijoFrontRunnable", [hashRespuesta], { value: 0n });
  const acertijoCommitReveal = m.contract("AcertijoCommitReveal", [hashRespuesta], { value: 0n });

  return { acertijoVulnerable, acertijoCommitReveal };
});
