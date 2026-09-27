import { network } from "hardhat";
import { encodeFunctionData } from "viem";

const { viem } = await network.create();
const publicClient = await viem.getPublicClient();

const loops = await viem.deployContract("GasEnLoops");
for (let i = 0; i < 20; i++) {
  await loops.write.agregar([BigInt(i)]);
}

const gasSinCache = await publicClient.estimateGas({
  to: loops.address,
  data: encodeFunctionData({ abi: loops.abi, functionName: "sumarSinCache" }),
});
const gasConCache = await publicClient.estimateGas({
  to: loops.address,
  data: encodeFunctionData({ abi: loops.abi, functionName: "sumarConCache" }),
});

console.log("GasEnLoops desplegado en:", loops.address);
console.log("Gas sin cachear la longitud:", gasSinCache.toString());
console.log("Gas cacheando la longitud: ", gasConCache.toString());
