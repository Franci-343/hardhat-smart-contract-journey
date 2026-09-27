import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { hexToSignature, parseEther } from "viem";

describe("13 - Firmas EIP-712", async function () {
  const { viem } = await network.create();
  const [relayer, firmante, destino] = await viem.getWalletClients();

  async function firmarAutorizacion(
    contrato: Awaited<ReturnType<typeof desplegar>>,
    args: { destino: `0x${string}`; monto: bigint; nonce: bigint; plazo: bigint },
  ) {
    const firma = await firmante.signTypedData({
      domain: {
        name: "Curso Solidity Avanzado",
        version: "1",
        chainId: await (await viem.getPublicClient()).getChainId(),
        verifyingContract: contrato.address,
      },
      types: {
        Autorizacion: [
          { name: "destino", type: "address" },
          { name: "monto", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "plazo", type: "uint256" },
        ],
      },
      primaryType: "Autorizacion",
      message: args,
    });

    const { r, s, v } = hexToSignature(firma);
    return { r, s, v: Number(v) };
  }

  async function desplegar() {
    return viem.deployContract("FirmasEIP712");
  }

  it("una firma EIP-712 valida mueve fondos sin que el firmante envie la transaccion", async function () {
    const contrato = await desplegar();
    await contrato.write.depositar({ value: parseEther("1"), account: firmante.account });

    const plazo = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const { r, s, v } = await firmarAutorizacion(contrato, {
      destino: destino.account.address,
      monto: parseEther("0.4"),
      nonce: 0n,
      plazo,
    });

    // El RELAYER envia la transaccion (y paga el gas), pero el saldo que
    // se mueve es el del firmante, no el del relayer.
    await viem.assertions.emitWithArgs(
      contrato.write.ejecutarConFirma(
        [firmante.account.address, destino.account.address, parseEther("0.4"), 0n, plazo, v, r, s],
        { account: relayer.account },
      ),
      contrato,
      "Ejecutada",
      [firmante.account.address, destino.account.address, parseEther("0.4"), 0n],
    );

    assert.equal(await contrato.read.saldos([firmante.account.address]), parseEther("0.6"));
    assert.equal(await contrato.read.saldos([destino.account.address]), parseEther("0.4"));
    assert.equal(await contrato.read.nonces([firmante.account.address]), 1n);
  });

  it("la misma firma no se puede reutilizar (el nonce ya avanzo)", async function () {
    const contrato = await desplegar();
    await contrato.write.depositar({ value: parseEther("1"), account: firmante.account });

    const plazo = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const { r, s, v } = await firmarAutorizacion(contrato, {
      destino: destino.account.address,
      monto: parseEther("0.1"),
      nonce: 0n,
      plazo,
    });

    await contrato.write.ejecutarConFirma([
      firmante.account.address,
      destino.account.address,
      parseEther("0.1"),
      0n,
      plazo,
      v,
      r,
      s,
    ]);

    await viem.assertions.revertWithCustomErrorWithArgs(
      contrato.write.ejecutarConFirma([
        firmante.account.address,
        destino.account.address,
        parseEther("0.1"),
        0n,
        plazo,
        v,
        r,
        s,
      ]),
      contrato,
      "NonceIncorrecto",
      [1n, 0n],
    );
  });

  it("una firma vencida revierte", async function () {
    const contrato = await desplegar();
    await contrato.write.depositar({ value: parseEther("1"), account: firmante.account });

    const plazoVencido = BigInt(Math.floor(Date.now() / 1000) - 10);
    const { r, s, v } = await firmarAutorizacion(contrato, {
      destino: destino.account.address,
      monto: parseEther("0.1"),
      nonce: 0n,
      plazo: plazoVencido,
    });

    await viem.assertions.revertWithCustomError(
      contrato.write.ejecutarConFirma([
        firmante.account.address,
        destino.account.address,
        parseEther("0.1"),
        0n,
        plazoVencido,
        v,
        r,
        s,
      ]),
      contrato,
      "FirmaExpirada",
    );
  });

  it("cambiar un solo campo del mensaje invalida la firma (otro hash, otro firmante recuperado)", async function () {
    const contrato = await desplegar();
    await contrato.write.depositar({ value: parseEther("1"), account: firmante.account });

    const plazo = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const { r, s, v } = await firmarAutorizacion(contrato, {
      destino: destino.account.address,
      monto: parseEther("0.1"),
      nonce: 0n,
      plazo,
    });

    // Se firmo para 0.1, pero se intenta ejecutar por 0.9: el hash ya no
    // coincide, ecrecover devuelve otra direccion (o una invalida).
    await viem.assertions.revertWithCustomError(
      contrato.write.ejecutarConFirma([
        firmante.account.address,
        destino.account.address,
        parseEther("0.9"),
        0n,
        plazo,
        v,
        r,
        s,
      ]),
      contrato,
      "FirmaInvalida",
    );
  });
});
