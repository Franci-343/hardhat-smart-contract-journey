import { network } from "hardhat";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const estadisticas = await viem.deployContract("Estadisticas");
console.log("Estadisticas desplegado en:", estadisticas.address);

for (const dato of [10n, 20n, 30n]) {
  const hash = await estadisticas.write.agregar([dato]);
  await publicClient.waitForTransactionReceipt({ hash });
}

console.log("Total:", await estadisticas.read.total());
console.log("Comision del 2.5% sobre 1000:", await estadisticas.read.comision([1000n, 250n]));
