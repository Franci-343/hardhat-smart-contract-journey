import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("16 - ERC-1155 basico", async function () {
  const { viem } = await network.create();
  const [owner, alice, bob] = await viem.getWalletClients();

  const ID_ORO = 1n;
  const ID_ESPADA = 2n;

  async function desplegarConTokens() {
    const nft = await viem.deployContract("ERC1155Basico");
    await nft.write.mint([alice.account.address, ID_ORO, 100n, "ipfs://oro"]);
    await nft.write.mint([alice.account.address, ID_ESPADA, 1n, "ipfs://espada"]);
    return { nft };
  }

  it("mint acuna cantidades por id y emite TransferSingle", async function () {
    const nft = await viem.deployContract("ERC1155Basico");

    await viem.assertions.emitWithArgs(
      nft.write.mint([alice.account.address, ID_ORO, 100n, "ipfs://oro"]),
      nft,
      "TransferSingle",
      [
        getAddress(owner.account.address),
        "0x0000000000000000000000000000000000000000",
        getAddress(alice.account.address),
        ID_ORO,
        100n,
      ],
    );

    assert.equal(await nft.read.balanceOf([alice.account.address, ID_ORO]), 100n);
    assert.equal(await nft.read.uri([ID_ORO]), "ipfs://oro");
  });

  it("mintBatch acuna varios ids de una vez", async function () {
    const nft = await viem.deployContract("ERC1155Basico");

    await nft.write.mintBatch([alice.account.address, [ID_ORO, ID_ESPADA], [50n, 2n]]);

    assert.deepEqual(
      await nft.read.balanceOfBatch([
        [alice.account.address, alice.account.address],
        [ID_ORO, ID_ESPADA],
      ]),
      [50n, 2n],
    );
  });

  it("solo el owner puede mintear", async function () {
    const { nft } = await desplegarConTokens();

    await viem.assertions.revertWithCustomError(
      nft.write.mint([alice.account.address, ID_ORO, 1n, ""], { account: alice.account }),
      nft,
      "NoEsOwner",
    );
  });

  it("el dueno transfiere una cantidad de un id a otra cuenta", async function () {
    const { nft } = await desplegarConTokens();

    await nft.write.safeTransferFrom([alice.account.address, bob.account.address, ID_ORO, 30n, "0x"], {
      account: alice.account,
    });

    assert.equal(await nft.read.balanceOf([alice.account.address, ID_ORO]), 70n);
    assert.equal(await nft.read.balanceOf([bob.account.address, ID_ORO]), 30n);
  });

  it("transferir mas de lo que se tiene revierte", async function () {
    const { nft } = await desplegarConTokens();

    await viem.assertions.revertWithCustomError(
      nft.write.safeTransferFrom([alice.account.address, bob.account.address, ID_ORO, 1000n, "0x"], {
        account: alice.account,
      }),
      nft,
      "SaldoInsuficiente",
    );
  });

  it("un tercero sin permiso no puede transferir", async function () {
    const { nft } = await desplegarConTokens();

    await viem.assertions.revertWithCustomError(
      nft.write.safeTransferFrom([alice.account.address, bob.account.address, ID_ORO, 10n, "0x"], {
        account: bob.account,
      }),
      nft,
      "NoAutorizado",
    );
  });

  it("setApprovalForAll autoriza a un operador para todos los ids", async function () {
    const { nft } = await desplegarConTokens();

    await nft.write.setApprovalForAll([bob.account.address, true], { account: alice.account });
    assert.equal(await nft.read.isApprovedForAll([alice.account.address, bob.account.address]), true);

    await nft.write.safeTransferFrom([alice.account.address, bob.account.address, ID_ESPADA, 1n, "0x"], {
      account: bob.account,
    });

    assert.equal(await nft.read.balanceOf([bob.account.address, ID_ESPADA]), 1n);
  });

  it("safeBatchTransferFrom mueve varios ids en una sola llamada", async function () {
    const { nft } = await desplegarConTokens();

    await viem.assertions.emitWithArgs(
      nft.write.safeBatchTransferFrom(
        [alice.account.address, bob.account.address, [ID_ORO, ID_ESPADA], [20n, 1n], "0x"],
        { account: alice.account },
      ),
      nft,
      "TransferBatch",
      [getAddress(alice.account.address), getAddress(alice.account.address), getAddress(bob.account.address), [ID_ORO, ID_ESPADA], [20n, 1n]],
    );

    assert.equal(await nft.read.balanceOf([bob.account.address, ID_ORO]), 20n);
    assert.equal(await nft.read.balanceOf([bob.account.address, ID_ESPADA]), 1n);
    assert.equal(await nft.read.balanceOf([alice.account.address, ID_ORO]), 80n);
    assert.equal(await nft.read.balanceOf([alice.account.address, ID_ESPADA]), 0n);
  });

  it("transferir a un contrato receptor funciona", async function () {
    const { nft } = await desplegarConTokens();
    const receptor = await viem.deployContract("ReceptorERC1155");

    await nft.write.safeTransferFrom([alice.account.address, receptor.address, ID_ORO, 5n, "0x"], {
      account: alice.account,
    });

    assert.equal(await nft.read.balanceOf([receptor.address, ID_ORO]), 5n);
  });

  it("transferir a un contrato que no sabe recibir ERC-1155 revierte", async function () {
    const { nft } = await desplegarConTokens();
    const noReceptor = await viem.deployContract("NoReceptorERC1155");

    await viem.assertions.revertWithCustomError(
      nft.write.safeTransferFrom([alice.account.address, noReceptor.address, ID_ORO, 5n, "0x"], {
        account: alice.account,
      }),
      nft,
      "ReceptorInvalido",
    );
  });

  it("supportsInterface reconoce ERC-165 y ERC-1155", async function () {
    const { nft } = await desplegarConTokens();

    assert.equal(await nft.read.supportsInterface(["0x01ffc9a7"]), true);
    assert.equal(await nft.read.supportsInterface(["0xd9b67a26"]), true);
    assert.equal(await nft.read.supportsInterface(["0xffffffff"]), false);
  });
});
