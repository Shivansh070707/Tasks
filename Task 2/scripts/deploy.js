const { ethers } = require("hardhat");
const fs = require("fs");

fs.mkdir("build", (err) => {
  if (err) console.log(err);
  console.log("File created");
});

async function main() {
  const GOLD = await ethers.getContractFactory("Gold");
  const gold = await GOLD.deploy();
  await gold.deployed();

  const SILVER = await ethers.getContractFactory("Silver");
  const silver = await SILVER.deploy();
  await silver.deployed();

  const UNISWAP = await ethers.getContractFactory("Liquidity");
  const uniswap = await UNISWAP.deploy(silver.address, gold.address);
  await uniswap.deployed();

  let GoldData = {
    address: gold.address,
    network: {
      name: gold.provider._network.name,
      chainId: gold.provider._network.chainId,
    },
    abi: JSON.parse(gold.interface.format("json")),
  };
  fs.writeFileSync("build/Gold.json", JSON.stringify(GoldData, null, "\t"));

  let SilverData = {
    address: silver.address,
    network: {
      name: silver.provider._network.name,
      chainId: silver.provider._network.chainId,
    },
    abi: JSON.parse(silver.interface.format("json")),
  };
  fs.writeFileSync("build/Silver.json", JSON.stringify(SilverData, null, "\t"));

  let UniswapData = {
    address: uniswap.address,
    network: {
      name: uniswap.provider._network.name,
      chainId: uniswap.provider._network.chainId,
    },
    abi: JSON.parse(uniswap.interface.format("json")),
  };
  fs.writeFileSync(
    "build/Uniswap.json",
    JSON.stringify(UniswapData, null, "\t")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
