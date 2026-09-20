import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, zeroAddress } from "viem";

describe("15 - ERC-721 basico", async function () {
  const { viem, networkHelpers } = await network.create();
  const [owner, alice, bob] = await viem.getWalletClients();

  async function desplegarNft() {
    const nft = await viem.deployContract("ERC721Basico", ["Coleccion Curso", "CCU"]);
    return { nft };
  }

  async function desplegarConToken() {
    const nft = await viem.deployContract("ERC721Basico", ["Coleccion Curso", "CCU"]);
    await nft.write.mint([alice.account.address, "ipfs://token-0"]); // tokenId 0
    return { nft };
  }

  it("expone nombre y simbolo", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarNft);

    assert.equal(await nft.read.name(), "Coleccion Curso");
    assert.equal(await nft.read.symbol(), "CCU");
  });

  it("mint asigna un token unico con su URI y emite Transfer", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarNft);

    await viem.assertions.emitWithArgs(nft.write.mint([alice.account.address, "ipfs://a"]), nft, "Transfer", [
      zeroAddress,
      getAddress(alice.account.address),
      0n,
    ]);

    assert.equal(getAddress(await nft.read.ownerOf([0n])), getAddress(alice.account.address));
    assert.equal(await nft.read.balanceOf([alice.account.address]), 1n);
    assert.equal(await nft.read.tokenURI([0n]), "ipfs://a");
    assert.equal(await nft.read.totalMinteados(), 1n);
  });

  it("solo el owner puede mintear", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarNft);

    await viem.assertions.revertWithCustomError(
      nft.write.mint([bob.account.address, "x"], { account: bob.account }),
      nft,
      "NoEsOwner",
    );
  });

  it("consultar un token inexistente revierte", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarNft);

    await viem.assertions.revertWithCustomError(nft.read.ownerOf([99n]), nft, "TokenInexistente");
  });

  it("el dueno transfiere su NFT", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);

    await nft.write.transferFrom([alice.account.address, bob.account.address, 0n], { account: alice.account });

    assert.equal(getAddress(await nft.read.ownerOf([0n])), getAddress(bob.account.address));
    assert.equal(await nft.read.balanceOf([alice.account.address]), 0n);
    assert.equal(await nft.read.balanceOf([bob.account.address]), 1n);
  });

  it("un tercero sin permiso no puede transferir", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);

    await viem.assertions.revertWithCustomError(
      nft.write.transferFrom([alice.account.address, bob.account.address, 0n], { account: bob.account }),
      nft,
      "NoAutorizado",
    );
  });

  it("approve autoriza a un tercero para UN token y se borra al transferir", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);

    await nft.write.approve([bob.account.address, 0n], { account: alice.account });
    assert.equal(getAddress(await nft.read.getApproved([0n])), getAddress(bob.account.address));

    await nft.write.transferFrom([alice.account.address, bob.account.address, 0n], { account: bob.account });

    assert.equal(await nft.read.getApproved([0n]), zeroAddress);
  });

  it("setApprovalForAll autoriza a un operador para todos los tokens", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);

    await nft.write.setApprovalForAll([bob.account.address, true], { account: alice.account });
    assert.equal(await nft.read.isApprovedForAll([alice.account.address, bob.account.address]), true);

    await nft.write.transferFrom([alice.account.address, owner.account.address, 0n], { account: bob.account });

    assert.equal(getAddress(await nft.read.ownerOf([0n])), getAddress(owner.account.address));
  });

  it("safeTransferFrom a un contrato receptor funciona", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);
    const receptor = await viem.deployContract("ReceptorNFT");

    await nft.write.safeTransferFrom([alice.account.address, receptor.address, 0n], { account: alice.account });

    assert.equal(getAddress(await nft.read.ownerOf([0n])), getAddress(receptor.address));
    assert.equal(await receptor.read.ultimoTokenId(), 0n);
    assert.equal(getAddress(await receptor.read.ultimoRemitente()), getAddress(alice.account.address));
  });

  it("safeTransferFrom a un contrato que no sabe recibir NFTs revierte", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);
    const noReceptor = await viem.deployContract("NoReceptorNFT");

    await viem.assertions.revertWithCustomError(
      nft.write.safeTransferFrom([alice.account.address, noReceptor.address, 0n], { account: alice.account }),
      nft,
      "ReceptorInvalido",
    );
  });

  it("transferFrom (sin safe) SI deja el NFT atrapado en un contrato incompatible", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);
    const noReceptor = await viem.deployContract("NoReceptorNFT");

    await nft.write.transferFrom([alice.account.address, noReceptor.address, 0n], { account: alice.account });

    assert.equal(getAddress(await nft.read.ownerOf([0n])), getAddress(noReceptor.address));
  });

  it("burn destruye el token", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarConToken);

    await nft.write.burn([0n], { account: alice.account });

    assert.equal(await nft.read.balanceOf([alice.account.address]), 0n);
    await viem.assertions.revertWithCustomError(nft.read.ownerOf([0n]), nft, "TokenInexistente");
  });

  it("supportsInterface (ERC-165) reconoce ERC-165, ERC-721 y Metadata", async function () {
    const { nft } = await networkHelpers.loadFixture(desplegarNft);

    assert.equal(await nft.read.supportsInterface(["0x01ffc9a7"]), true);
    assert.equal(await nft.read.supportsInterface(["0x80ac58cd"]), true);
    assert.equal(await nft.read.supportsInterface(["0x5b5e139f"]), true);
    assert.equal(await nft.read.supportsInterface(["0xffffffff"]), false);
  });
});
