import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { toFunctionSelector, toHex } from "viem";

describe("04 - Interfaces", async function () {
  const { viem } = await network.create();
  const [owner] = await viem.getWalletClients();

  it("AlmacenSimple cumple la interfaz y guarda el valor tal cual", async function () {
    const almacen = await viem.deployContract("AlmacenSimple");

    await almacen.write.guardar([7n]);

    assert.equal(await almacen.read.obtener(), 7n);
  });

  it("AlmacenDoble cumple la misma interfaz con otro comportamiento", async function () {
    const almacen = await viem.deployContract("AlmacenDoble");

    await almacen.write.guardar([7n]);

    assert.equal(await almacen.read.obtener(), 14n);
  });

  it("emite el evento definido en la interfaz", async function () {
    const almacen = await viem.deployContract("AlmacenSimple");

    await viem.assertions.emitWithArgs(almacen.write.guardar([5n]), almacen, "Guardado", [
      owner.account.address,
      5n,
    ]);
  });

  it("ClienteAlmacen funciona con cualquier implementacion de IAlmacen", async function () {
    const cliente = await viem.deployContract("ClienteAlmacen");
    const simple = await viem.deployContract("AlmacenSimple");
    const doble = await viem.deployContract("AlmacenDoble");

    await cliente.write.guardarEn([simple.address, 10n]);
    await cliente.write.guardarEn([doble.address, 10n]);

    assert.equal(await cliente.read.leerDe([simple.address]), 10n);
    assert.equal(await cliente.read.leerDe([doble.address]), 20n);
  });

  it("interfaceId es el XOR de los selectores de la interfaz", async function () {
    const cliente = await viem.deployContract("ClienteAlmacen");

    const selectorGuardar = BigInt(toFunctionSelector("guardar(uint256)"));
    const selectorObtener = BigInt(toFunctionSelector("obtener()"));
    const esperado = toHex(selectorGuardar ^ selectorObtener, { size: 4 });

    assert.equal(await cliente.read.idInterfaz(), esperado);
  });
});
