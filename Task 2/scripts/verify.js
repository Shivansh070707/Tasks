const Gold = require("../Build/Gold.json");
const Silver = require("../Build/Silver.json");
const Uniswap = require("../Build/Uniswap.json");

async function main() {
  await hre.run("verify:verify", {
    address: Gold.address,
    constructorArguments: [Gold.abi],
  });

  await hre.run("verify:verify", {
    address: Silver.address,
    constructorArguments: [Silver.abi],
  });

  await hre.run("verify:verify", {
    address: Uniswap.address,
    constructorArguments: [Uniswap.abi],
  });
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
