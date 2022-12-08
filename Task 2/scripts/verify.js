const Gold = require("../Build/Gold.json");
const Silver = require("../Build/Silver.json");
const Uniswap = require("../Build/Uniswap.json");

async function main() {
  await hre.run("verify:verify", {
    contract: "contracts/Tokens.sol:Gold",
    address: Gold.address,
  });

  await hre.run("verify:verify", {
    contract: "contracts/Tokens.sol:Silver",
    address: Silver.address,
  });

  await hre.run("verify:verify", {
    contract: "contracts/Liquidity.sol:Liquidity",
    address: Uniswap.address,
    constructorArguments: [Silver.address, Gold.address],
  });
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
