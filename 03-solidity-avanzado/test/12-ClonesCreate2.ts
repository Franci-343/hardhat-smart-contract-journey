import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, getCreate2Address, keccak256, pad, toHex, concatHex } from "viem";

describe("12 - Clones minimos y CREATE2", async function () {
  const { viem } = await network.create();
  const [owner, alguien] = await viem.getWalletClients();

  // Mismo bytecode de creacion que el contrato, calculado en TypeScript
  // para poder cruzar los resultados con la utilidad de viem.
  function bytecodeClon(implementacion: `0x${string}`) {
    return concatHex([
      "0x3d602d80600a3d3981f3",
      "0x363d3d373d3d3d363d73",
      pad(implementacion, { size: 20 }),
      "0x5af43d82803e903d91602b57fd5bf3",
    ]);
  }

  it("un clon delegatecallea a la implementacion y tiene su propio storage", async function () {
    const plantilla = await viem.deployContract("PlantillaContador");
    const fabrica = await viem.deployContract("FabricaClones");

    const { result: direccionClon } = await fabrica.simulate.clonar([plantilla.address]);
    await fabrica.write.clonar([plantilla.address]);

    const clon = await viem.getContractAt("PlantillaContador", direccionClon);

    await clon.write.inicializar([owner.account.address]);
    await clon.write.incrementar();
    await clon.write.incrementar();

    assert.equal(await clon.read.contador(), 2n);

    // La plantilla original nunca se toco: el clon uso SU PROPIO storage.
    assert.equal(await plantilla.read.contador(), 0n);
    assert.equal(await plantilla.read.dueno(), "0x0000000000000000000000000000000000000000");
  });

  it("dos clones de la misma implementacion son independientes entre si", async function () {
    const plantilla = await viem.deployContract("PlantillaContador");
    const fabrica = await viem.deployContract("FabricaClones");

    const { result: direccion1 } = await fabrica.simulate.clonar([plantilla.address]);
    await fabrica.write.clonar([plantilla.address]);
    const { result: direccion2 } = await fabrica.simulate.clonar([plantilla.address]);
    await fabrica.write.clonar([plantilla.address]);

    assert.notEqual(getAddress(direccion1), getAddress(direccion2));

    const clon1 = await viem.getContractAt("PlantillaContador", direccion1);
    const clon2 = await viem.getContractAt("PlantillaContador", direccion2);

    await clon1.write.inicializar([owner.account.address]);
    await clon1.write.incrementar();

    assert.equal(await clon1.read.contador(), 1n);
    assert.equal(await clon2.read.contador(), 0n);
  });

  it("calcularDireccion predice exactamente donde caera clonarDeterministico", async function () {
    const plantilla = await viem.deployContract("PlantillaContador");
    const fabrica = await viem.deployContract("FabricaClones");

    const salt = keccak256(toHex("primer-clon"));

    const predicho = await fabrica.read.calcularDireccion([plantilla.address, salt]);

    // Verificacion cruzada, independiente del contrato: la misma formula
    // CREATE2, calculada con la utilidad de viem.
    const predichoConViem = getCreate2Address({
      from: fabrica.address,
      salt,
      bytecode: bytecodeClon(plantilla.address),
    });

    assert.equal(getAddress(predicho), getAddress(predichoConViem));

    await fabrica.write.clonarDeterministico([plantilla.address, salt]);

    const publicClient = await viem.getPublicClient();
    const codigoEnDireccionPredicha = await publicClient.getCode({ address: predicho });

    assert.ok(codigoEnDireccionPredicha && codigoEnDireccionPredicha !== "0x", "deberia haber codigo ahi");
  });

  it("usar el mismo salt dos veces revierte: la direccion ya tiene codigo", async function () {
    const plantilla = await viem.deployContract("PlantillaContador");
    const fabrica = await viem.deployContract("FabricaClones");

    const salt = keccak256(toHex("salt-repetido"));

    await fabrica.write.clonarDeterministico([plantilla.address, salt]);

    await viem.assertions.revert(fabrica.write.clonarDeterministico([plantilla.address, salt]));
  });

  it("clonar con una implementacion distinta da otra direccion, mismo salt", async function () {
    const plantillaA = await viem.deployContract("PlantillaContador");
    const plantillaB = await viem.deployContract("PlantillaContador");
    const fabrica = await viem.deployContract("FabricaClones");

    const salt = keccak256(toHex("mismo-salt"));

    const direccionA = await fabrica.read.calcularDireccion([plantillaA.address, salt]);
    const direccionB = await fabrica.read.calcularDireccion([plantillaB.address, salt]);

    assert.notEqual(getAddress(direccionA), getAddress(direccionB));
  });
});
