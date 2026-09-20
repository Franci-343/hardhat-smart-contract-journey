import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, maxUint256, parseEther, zeroAddress } from "viem";

describe("14 - ERC-20 basico", async function () {
  const { viem, networkHelpers } = await network.create();
  const [owner, alice, bob] = await viem.getWalletClients();

  const SUMINISTRO = parseEther("1000");

  async function desplegarToken() {
    const token = await viem.deployContract("ERC20Basico", ["Token Curso", "TCU", 1000n]);
    return { token };
  }

  it("expone nombre, simbolo y decimales", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    assert.equal(await token.read.name(), "Token Curso");
    assert.equal(await token.read.symbol(), "TCU");
    assert.equal(await token.read.decimals(), 18);
  });

  it("el suministro inicial va a quien despliega", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    assert.equal(await token.read.totalSupply(), SUMINISTRO);
    assert.equal(await token.read.balanceOf([owner.account.address]), SUMINISTRO);
  });

  it("transfer mueve tokens y emite Transfer", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await viem.assertions.emitWithArgs(token.write.transfer([alice.account.address, 100n]), token, "Transfer", [
      getAddress(owner.account.address),
      getAddress(alice.account.address),
      100n,
    ]);

    assert.equal(await token.read.balanceOf([alice.account.address]), 100n);
    assert.equal(await token.read.balanceOf([owner.account.address]), SUMINISTRO - 100n);
  });

  it("transfer sin saldo suficiente revierte", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await viem.assertions.revertWithCustomError(
      token.write.transfer([bob.account.address, 1n], { account: alice.account }),
      token,
      "SaldoInsuficiente",
    );
  });

  it("no se puede transferir a la direccion cero", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await viem.assertions.revertWithCustomError(
      token.write.transfer([zeroAddress, 1n]),
      token,
      "DireccionInvalida",
    );
  });

  it("approve + transferFrom: un tercero mueve tokens con permiso", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await viem.assertions.emitWithArgs(token.write.approve([alice.account.address, 300n]), token, "Approval", [
      getAddress(owner.account.address),
      getAddress(alice.account.address),
      300n,
    ]);
    assert.equal(await token.read.allowance([owner.account.address, alice.account.address]), 300n);

    await token.write.transferFrom([owner.account.address, bob.account.address, 200n], {
      account: alice.account,
    });

    assert.equal(await token.read.balanceOf([bob.account.address]), 200n);
    assert.equal(await token.read.allowance([owner.account.address, alice.account.address]), 100n);
  });

  it("transferFrom sin allowance suficiente revierte", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);
    await token.write.approve([alice.account.address, 50n]);

    await viem.assertions.revertWithCustomError(
      token.write.transferFrom([owner.account.address, bob.account.address, 51n], { account: alice.account }),
      token,
      "AllowanceInsuficiente",
    );
  });

  it("un allowance infinito no se descuenta", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);
    await token.write.approve([alice.account.address, maxUint256]);

    await token.write.transferFrom([owner.account.address, bob.account.address, 10n], {
      account: alice.account,
    });

    assert.equal(await token.read.allowance([owner.account.address, alice.account.address]), maxUint256);
  });

  it("solo el owner puede mintear", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await viem.assertions.revertWithCustomError(
      token.write.mint([alice.account.address, 1n], { account: alice.account }),
      token,
      "NoEsOwner",
    );

    await token.write.mint([alice.account.address, 500n]);

    assert.equal(await token.read.balanceOf([alice.account.address]), 500n);
    assert.equal(await token.read.totalSupply(), SUMINISTRO + 500n);
  });

  it("burn destruye tokens y reduce el suministro", async function () {
    const { token } = await networkHelpers.loadFixture(desplegarToken);

    await token.write.burn([parseEther("1")]);

    assert.equal(await token.read.totalSupply(), SUMINISTRO - parseEther("1"));
    assert.equal(await token.read.balanceOf([owner.account.address]), SUMINISTRO - parseEther("1"));

    await viem.assertions.revertWithCustomError(
      token.write.burn([1n], { account: alice.account }),
      token,
      "SaldoInsuficiente",
    );
  });
});
