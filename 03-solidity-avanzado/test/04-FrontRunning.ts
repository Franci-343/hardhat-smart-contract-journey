import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodePacked, getAddress, keccak256, parseEther, toBytes } from "viem";

describe("04 - Front-running y commit-reveal", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [, victima, atacante] = await viem.getWalletClients();

  const RESPUESTA = "ETHEREUM";
  const hashRespuesta = keccak256(toBytes(RESPUESTA));

  describe("version vulnerable", function () {
    it("un atacante que copia la respuesta se queda con el premio", async function () {
      const acertijo = await viem.deployContract("AcertijoFrontRunnable", [hashRespuesta], {
        value: parseEther("1"),
      });

      // La victima resolvio el acertijo y esta a punto de enviar su
      // transaccion... pero el atacante vio "ETHEREUM" en el mempool y
      // envia la SUYA primero (con mas gas, en la vida real).
      await acertijo.write.resolver([RESPUESTA], { account: atacante.account });

      assert.equal(getAddress(await acertijo.read.ganador()), getAddress(atacante.account.address));

      // Cuando la transaccion de la victima finalmente se mina, ya es tarde.
      await viem.assertions.revertWith(
        acertijo.write.resolver([RESPUESTA], { account: victima.account }),
        "Ya resuelto",
      );
    });
  });

  describe("version corregida (commit-reveal)", function () {
    it("copiar la respuesta revelada no sirve: el compromiso es de otra direccion", async function () {
      const acertijo = await viem.deployContract("AcertijoCommitReveal", [hashRespuesta], {
        value: parseEther("1"),
      });

      const secreto = keccak256(toBytes("secreto-de-la-victima"));
      const hashCompromiso = keccak256(
        encodePacked(["string", "bytes32", "address"], [RESPUESTA, secreto, victima.account.address]),
      );

      // Fase 1: la victima compromete un hash que no revela nada.
      await acertijo.write.comprometer([hashCompromiso], { account: victima.account });

      // El atacante, de alguna manera, se entera de (RESPUESTA, secreto)
      // -por ejemplo, viendo la transaccion de revelar en el mempool- y
      // trata de revelarlos el mismo, antes que la victima.
      await viem.assertions.revertWith(
        acertijo.write.revelar([RESPUESTA, secreto], { account: atacante.account }),
        "No coincide con tu compromiso",
      );

      // La victima si puede revelar: el hash coincide con SU compromiso.
      const antes = await publicClient.getBalance({ address: victima.account.address });
      await acertijo.write.revelar([RESPUESTA, secreto], { account: victima.account });
      const despues = await publicClient.getBalance({ address: victima.account.address });

      assert.equal(getAddress(await acertijo.read.ganador()), getAddress(victima.account.address));
      assert.ok(despues > antes, "la victima deberia haber cobrado el premio");
    });

    it("revelar una respuesta incorrecta revierte", async function () {
      const acertijo = await viem.deployContract("AcertijoCommitReveal", [hashRespuesta], {
        value: parseEther("1"),
      });

      const secreto = keccak256(toBytes("otro-secreto"));
      const hashCompromiso = keccak256(
        encodePacked(["string", "bytes32", "address"], ["BITCOIN", secreto, victima.account.address]),
      );

      await acertijo.write.comprometer([hashCompromiso], { account: victima.account });

      await viem.assertions.revertWith(
        acertijo.write.revelar(["BITCOIN", secreto], { account: victima.account }),
        "Respuesta incorrecta",
      );
    });
  });
});
