import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress, parseEther, zeroAddress } from "viem";

describe("13 - Ownable y Pausable", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [owner, alice, bob] = await viem.getWalletClients();

  describe("propiedad en dos pasos", function () {
    it("el desplegador es el owner", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      assert.equal(getAddress(await boveda.read.owner()), getAddress(owner.account.address));
    });

    it("la propiedad solo cambia cuando el nuevo dueno acepta", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await boveda.write.proponerPropietario([alice.account.address]);
      // Propuesto, pero todavia manda el dueno original.
      assert.equal(getAddress(await boveda.read.owner()), getAddress(owner.account.address));

      await boveda.write.aceptarPropiedad({ account: alice.account });
      assert.equal(getAddress(await boveda.read.owner()), getAddress(alice.account.address));
      assert.equal(await boveda.read.pendingOwner(), zeroAddress);
    });

    it("solo el propuesto puede aceptar", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      await boveda.write.proponerPropietario([alice.account.address]);

      await viem.assertions.revertWithCustomError(
        boveda.write.aceptarPropiedad({ account: bob.account }),
        boveda,
        "NoEsPendiente",
      );
    });

    it("solo el owner puede proponer un sucesor", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await viem.assertions.revertWithCustomError(
        boveda.write.proponerPropietario([bob.account.address], { account: alice.account }),
        boveda,
        "NoEsPropietario",
      );
    });

    it("renunciar deja el contrato sin dueno", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await boveda.write.renunciarPropiedad();

      assert.equal(await boveda.read.owner(), zeroAddress);
      await viem.assertions.revertWithCustomError(boveda.write.pausar(), boveda, "NoEsPropietario");
    });
  });

  describe("pausa de emergencia", function () {
    it("funciona con normalidad mientras no esta pausado", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await boveda.write.depositar({ value: parseEther("1"), account: alice.account });

      assert.equal(await boveda.read.saldos([alice.account.address]), parseEther("1"));
    });

    it("solo el owner puede pausar y reanudar", async function () {
      const boveda = await viem.deployContract("BovedaSegura");

      await viem.assertions.revertWithCustomError(
        boveda.write.pausar({ account: alice.account }),
        boveda,
        "NoEsPropietario",
      );

      await viem.assertions.emit(boveda.write.pausar(), boveda, "Pausado");
      assert.equal(await boveda.read.paused(), true);

      await viem.assertions.emit(boveda.write.reanudar(), boveda, "Reanudado");
      assert.equal(await boveda.read.paused(), false);
    });

    it("pausado bloquea depositar y retirar", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      await boveda.write.depositar({ value: parseEther("1"), account: alice.account });
      await boveda.write.pausar();

      await viem.assertions.revertWithCustomError(
        boveda.write.depositar({ value: 1n, account: alice.account }),
        boveda,
        "ContratoPausado",
      );
      await viem.assertions.revertWithCustomError(
        boveda.write.retirar({ account: alice.account }),
        boveda,
        "ContratoPausado",
      );
    });

    it("no se puede pausar dos veces", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      await boveda.write.pausar();

      await viem.assertions.revertWithCustomError(boveda.write.pausar(), boveda, "ContratoPausado");
    });

    it("al reanudar, los usuarios retiran su saldo", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      await boveda.write.depositar({ value: parseEther("1"), account: alice.account });
      await boveda.write.pausar();
      await boveda.write.reanudar();

      await boveda.write.retirar({ account: alice.account });

      assert.equal(await boveda.read.saldos([alice.account.address]), 0n);
      assert.equal(await publicClient.getBalance({ address: boveda.address }), 0n);
    });

    it("retiroDeEmergencia solo funciona con el contrato pausado", async function () {
      const boveda = await viem.deployContract("BovedaSegura");
      await boveda.write.depositar({ value: parseEther("1"), account: alice.account });

      await viem.assertions.revertWithCustomError(
        boveda.write.retiroDeEmergencia([bob.account.address]),
        boveda,
        "ContratoNoPausado",
      );

      await boveda.write.pausar();

      const antes = await publicClient.getBalance({ address: bob.account.address });
      await boveda.write.retiroDeEmergencia([bob.account.address]);
      const despues = await publicClient.getBalance({ address: bob.account.address });

      assert.equal(despues - antes, parseEther("1"));
    });
  });
});
