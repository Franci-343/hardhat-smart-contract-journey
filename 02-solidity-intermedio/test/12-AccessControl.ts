import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("12 - Control de acceso por roles", async function () {
  const { viem } = await network.create();
  const [admin, alice, bob] = await viem.getWalletClients();

  it("quien despliega recibe ADMIN_ROLE", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const ADMIN = await contrato.read.ADMIN_ROLE();

    assert.equal(await contrato.read.tieneRol([ADMIN, admin.account.address]), true);
    assert.equal(await contrato.read.tieneRol([ADMIN, alice.account.address]), false);
  });

  it("un admin otorga un rol y se emite el evento", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();

    await viem.assertions.emitWithArgs(
      contrato.write.otorgarRol([MINTER, alice.account.address]),
      contrato,
      "RolOtorgado",
      [MINTER, alice.account.address, admin.account.address],
    );

    assert.equal(await contrato.read.tieneRol([MINTER, alice.account.address]), true);
  });

  it("solo quien tiene el rol puede usar la funcion protegida", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();
    await contrato.write.otorgarRol([MINTER, alice.account.address]);

    await contrato.write.emitir([100n], { account: alice.account });
    assert.equal(await contrato.read.totalEmitido(), 100n);

    await viem.assertions.revertWithCustomErrorWithArgs(
      contrato.write.emitir([100n], { account: bob.account }),
      contrato,
      "SinRol",
      [MINTER, bob.account.address],
    );
  });

  it("los roles son independientes: MINTER no puede editar", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();
    const EDITOR = await contrato.read.EDITOR_ROLE();

    await contrato.write.otorgarRol([MINTER, alice.account.address]);
    await viem.assertions.revertWithCustomError(
      contrato.write.cambiarMensaje(["hola"], { account: alice.account }),
      contrato,
      "SinRol",
    );

    await contrato.write.otorgarRol([EDITOR, alice.account.address]);
    await contrato.write.cambiarMensaje(["hola"], { account: alice.account });
    assert.equal(await contrato.read.mensaje(), "hola");
  });

  it("solo un admin puede otorgar o revocar roles", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();

    await viem.assertions.revertWithCustomError(
      contrato.write.otorgarRol([MINTER, bob.account.address], { account: alice.account }),
      contrato,
      "SinRol",
    );
    await viem.assertions.revertWithCustomError(
      contrato.write.revocarRol([MINTER, bob.account.address], { account: alice.account }),
      contrato,
      "SinRol",
    );
  });

  it("revocar un rol quita el acceso", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();
    await contrato.write.otorgarRol([MINTER, alice.account.address]);

    await contrato.write.revocarRol([MINTER, alice.account.address]);

    assert.equal(await contrato.read.tieneRol([MINTER, alice.account.address]), false);
    await viem.assertions.revertWithCustomError(
      contrato.write.emitir([1n], { account: alice.account }),
      contrato,
      "SinRol",
    );
  });

  it("cada cuenta puede renunciar a su propio rol", async function () {
    const contrato = await viem.deployContract("ControlDeAcceso");
    const MINTER = await contrato.read.MINTER_ROLE();
    await contrato.write.otorgarRol([MINTER, alice.account.address]);

    await contrato.write.renunciarRol([MINTER], { account: alice.account });

    assert.equal(await contrato.read.tieneRol([MINTER, alice.account.address]), false);
  });
});
