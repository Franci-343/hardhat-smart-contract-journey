import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre, { network } from "hardhat";
import { encodeFunctionData } from "viem";

describe("06 - Gas II: patrones de codigo", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  describe("cachear numeros.length en un loop", function () {
    it("da el mismo resultado con y sin cache", async function () {
      const contrato = await viem.deployContract("GasEnLoops");

      for (const valor of [10n, 20n, 30n]) {
        await contrato.write.agregar([valor]);
      }

      assert.equal(await contrato.read.sumarSinCache(), 60n);
      assert.equal(await contrato.read.sumarConCache(), 60n);
    });

    it("cachear la longitud gasta menos gas mientras mas elementos haya", async function () {
      const contrato = await viem.deployContract("GasEnLoops");

      for (let i = 0; i < 50; i++) {
        await contrato.write.agregar([BigInt(i)]);
      }

      const gasSinCache = await publicClient.estimateGas({
        to: contrato.address,
        data: encodeFunctionData({ abi: contrato.abi, functionName: "sumarSinCache" }),
      });
      const gasConCache = await publicClient.estimateGas({
        to: contrato.address,
        data: encodeFunctionData({ abi: contrato.abi, functionName: "sumarConCache" }),
      });

      assert.ok(gasConCache < gasSinCache, `conCache=${gasConCache} sinCache=${gasSinCache}`);
    });
  });

  describe("orden de && (cortocircuito)", function () {
    it("poner la condicion barata primero evita la verificacion cara", async function () {
      const contrato = await viem.deployContract("GasCortocircuito");
      const [, otro] = await viem.getWalletClients();

      await contrato.write.bloquear([otro.account.address]);

      const gasBarato = await publicClient.estimateGas({
        to: contrato.address,
        data: encodeFunctionData({
          abi: contrato.abi,
          functionName: "ordenBarato",
          args: [otro.account.address],
        }),
      });
      const gasCaro = await publicClient.estimateGas({
        to: contrato.address,
        data: encodeFunctionData({
          abi: contrato.abi,
          functionName: "ordenCaro",
          args: [otro.account.address],
        }),
      });

      // ordenCaro siempre paga _verificacionCara; ordenBarato la evita
      // porque el usuario ya esta bloqueado.
      assert.ok(gasBarato < gasCaro, `barato=${gasBarato} caro=${gasCaro}`);

      assert.equal(await contrato.read.ordenBarato([otro.account.address]), false);
      assert.equal(await contrato.read.ordenCaro([otro.account.address]), false);
    });
  });

  describe("require con string vs errores personalizados", function () {
    it("el contrato con errores personalizados despliega un bytecode mas chico", async function () {
      const artefactoString = await hre.artifacts.readArtifact("ErroresConString");
      const artefactoCustom = await hre.artifacts.readArtifact("ErroresConCustomError");

      const tamanoString = (artefactoString.deployedBytecode.length - 2) / 2; // quita "0x", 2 chars por byte
      const tamanoCustom = (artefactoCustom.deployedBytecode.length - 2) / 2;

      assert.ok(
        tamanoCustom < tamanoString,
        `custom=${tamanoCustom} bytes, string=${tamanoString} bytes`,
      );
    });

    it("ambas versiones se comportan igual cuando no hay error", async function () {
      const conString = await viem.deployContract("ErroresConString");
      const conCustom = await viem.deployContract("ErroresConCustomError");

      assert.equal(await conString.read.operacionA([10n]), 20n);
      assert.equal(await conCustom.read.operacionA([10n]), 20n);
    });

    it("ambas revierten, pero con distinto tipo de error", async function () {
      const conString = await viem.deployContract("ErroresConString");
      const conCustom = await viem.deployContract("ErroresConCustomError");

      await viem.assertions.revertWith(conString.read.operacionA([0n]), "El valor debe ser mayor a cero");
      await viem.assertions.revertWithCustomErrorWithArgs(conCustom.read.operacionA([0n]), conCustom, "ValorInvalido", [
        0n,
      ]);
    });
  });
});
