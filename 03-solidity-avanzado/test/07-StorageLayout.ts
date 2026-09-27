import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { concat, getAddress, keccak256, pad, toHex } from "viem";

describe("07 - Layout de storage", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, alguien] = await viem.getWalletClients();

  it("la herencia continua la numeracion de slots del padre", async function () {
    const contrato = await viem.deployContract("StorageLayout");

    await contrato.write.fijarValores([alguien.account.address, 222n]);

    // slot 0: valorPadre, un uint256 completo.
    const slot0 = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(0) });
    assert.equal(BigInt(slot0!), 111n);

    // slot 1: duenoPadre (20 bytes) + activo (1 byte), EMPACADOS JUNTOS
    // aunque uno es del padre y el otro del hijo.
    const slot1 = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(1) });
    // Los ultimos 20 bytes (40 hex) son la direccion; el byte justo antes es el bool.
    const direccionEnSlot1 = getAddress(`0x${slot1!.slice(-40)}`);
    const boolEnSlot1 = slot1!.slice(-42, -40); // el byte inmediatamente anterior a la direccion

    assert.equal(direccionEnSlot1, getAddress(alguien.account.address));
    assert.equal(boolEnSlot1, "01"); // activo = true

    // slot 2: numero, un uint256 nuevo (no compartio nada con el slot 1).
    const slot2 = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(2) });
    assert.equal(BigInt(slot2!), 222n);
  });

  it("un array dinamico guarda el largo en su slot y los elementos despues", async function () {
    const contrato = await viem.deployContract("StorageLayout");

    await contrato.write.agregarNumero([10n]);
    await contrato.write.agregarNumero([20n]);
    await contrato.write.agregarNumero([30n]);

    // `numeros` es el 4to campo de storage declarado (contando los del
    // padre): slot 3.
    const slotArray = 3n;
    const largo = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(slotArray) });
    assert.equal(BigInt(largo!), 3n);

    // Los elementos viven a partir de keccak256(slot del array), uno
    // detras del otro: elemento i en keccak256(slot) + i.
    const baseElementos = BigInt(keccak256(pad(toHex(slotArray), { size: 32 })));

    for (let i = 0; i < 3; i++) {
      const valor = await publicClient.getStorageAt({
        address: contrato.address,
        slot: toHex(baseElementos + BigInt(i)),
      });
      assert.equal(BigInt(valor!), BigInt((i + 1) * 10));
    }

    // Y coincide con lo que devuelve el getter generado automaticamente.
    assert.equal(await contrato.read.numeros([1n]), 20n);
  });

  it("un mapping no guarda nada en su propio slot: solo lo usa para hashear", async function () {
    const contrato = await viem.deployContract("StorageLayout");

    await contrato.write.fijarBalance([alguien.account.address, 999n]);

    // `balances` es el 5to campo declarado: slot 4. Ese slot en si mismo
    // sigue en cero: no guarda ningun balance directamente.
    const slotMapping = 4n;
    const contenidoDelSlot = await publicClient.getStorageAt({ address: contrato.address, slot: toHex(slotMapping) });
    assert.equal(BigInt(contenidoDelSlot!), 0n);

    // El valor real vive en keccak256(clave_paddeada_a_32_bytes ++ slot_paddeado_a_32_bytes).
    const claveHasheada = concat([
      pad(alguien.account.address, { size: 32 }),
      pad(toHex(slotMapping), { size: 32 }),
    ]);
    const slotDelValor = keccak256(claveHasheada);

    const valorCrudo = await publicClient.getStorageAt({ address: contrato.address, slot: slotDelValor });
    assert.equal(BigInt(valorCrudo!), 999n);

    // Y coincide con el getter generado automaticamente.
    assert.equal(await contrato.read.balances([alguien.account.address]), 999n);

    // Otra direccion, en otra posicion, no tiene nada.
    assert.equal(await contrato.read.balances([owner.account.address]), 0n);
  });
});
