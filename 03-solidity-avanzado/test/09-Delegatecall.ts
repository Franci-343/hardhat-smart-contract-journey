import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("09 - delegatecall", async function () {
  const { viem } = await network.create();
  const [owner, alguien] = await viem.getWalletClients();

  describe("colision de storage", function () {
    it("ProxyMalo: el delegatecall corrompe owner y no toca el contador real", async function () {
      const logica = await viem.deployContract("LogicaContador");
      const proxy = await viem.deployContract("ProxyMalo");

      const ownerAntes = await proxy.read.owner();
      assert.equal(getAddress(ownerAntes), getAddress(owner.account.address));
      assert.equal(await proxy.read.contador(), 0n);

      await proxy.write.incrementar([logica.address]);

      // El contador "de verdad" (slot 1) sigue en 0: Logica nunca escribio ahi.
      assert.equal(await proxy.read.contador(), 0n);

      // owner (slot 0) cambio: Logica escribio ahi creyendo que era `contador`.
      const ownerDespues = await proxy.read.owner();
      assert.notEqual(getAddress(ownerDespues), getAddress(ownerAntes));

      // El propio contrato Logica nunca se entero de nada de esto: su
      // storage no se toco (delegatecall usa el storage de quien llama).
      assert.equal(await logica.read.contador(), 0n);
    });

    it("ProxyBueno: mismo orden de variables, el delegatecall funciona bien", async function () {
      const logica = await viem.deployContract("LogicaContador");
      const proxy = await viem.deployContract("ProxyBueno");

      const ownerAntes = await proxy.read.owner();

      await proxy.write.incrementar([logica.address]);
      await proxy.write.incrementar([logica.address]);
      await proxy.write.fijar([logica.address, 100n]);

      assert.equal(await proxy.read.contador(), 100n);
      // owner no se toco: sigue en su propio slot, ajeno al de contador.
      assert.equal(getAddress(await proxy.read.owner()), getAddress(ownerAntes));
    });
  });

  describe("preservacion de contexto", function () {
    it("msg.sender dentro del delegatecall es quien llamo al proxy, no Logica", async function () {
      const logica = await viem.deployContract("LogicaContador");
      const proxy = await viem.deployContract("ProxyBueno");

      const { result } = await proxy.simulate.preguntarQuienLlama([logica.address], {
        account: alguien.account.address,
      });

      assert.equal(getAddress(result), getAddress(alguien.account.address));
    });
  });
});
