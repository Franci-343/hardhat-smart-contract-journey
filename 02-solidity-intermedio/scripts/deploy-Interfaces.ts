import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const simple = await viem.deployContract("AlmacenSimple");
const doble = await viem.deployContract("AlmacenDoble");
const cliente = await viem.deployContract("ClienteAlmacen");

console.log("AlmacenSimple desplegado en:", simple.address);
console.log("AlmacenDoble desplegado en:", doble.address);
console.log("ClienteAlmacen desplegado en:", cliente.address);

// El mismo cliente habla con dos implementaciones distintas de IAlmacen.
for (const almacen of [simple, doble]) {
  const hash = await cliente.write.guardarEn([almacen.address, 10n]);
  await publicClient.waitForTransactionReceipt({ hash });
}

console.log("Valor en AlmacenSimple:", await cliente.read.leerDe([simple.address]));
console.log("Valor en AlmacenDoble:", await cliente.read.leerDe([doble.address]));
console.log("interfaceId de IAlmacen:", await cliente.read.idInterfaz());
