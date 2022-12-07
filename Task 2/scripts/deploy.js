const { ethers } = require("hardhat");
const fs = require("fs");

fs.mkdir("Build", (err) => {
  if (err) console.log(err);
  console.log("File created");
});

async function main() {
  const GOLD = await ethers.getContractFactory("Gold");
  const Gold = await GOLD.deploy();

  const SILVER = await ethers.getContractFactory("Silver");
  const Silver = await SILVER.deploy();

  const UNISWAP = await ethers.getContractFactory("UniswapV2SwapExamples");
  const Uniswap = await UNISWAP.deploy(Silver.address, Gold.address);

  let GoldData = {
    address: Gold.address,
    network: {
      name: Gold.provider._network.name,
      chainId: Gold.provider._network.chainId,
    },
    abi: JSON.parse(Gold.interface.format("json")),
  };
  fs.writeFileSync("Build/Gold.json", JSON.stringify(GoldData, null, "\t"));

  let SilverData = {
    address: Silver.address,
    network: {
      name: Silver.provider._network.name,
      chainId: Silver.provider._network.chainId,
    },
    abi: JSON.parse(Silver.interface.format("json")),
  };
  fs.writeFileSync("Build/Silver.json", JSON.stringify(SilverData, null, "\t"));

  let UniswapData = {
    address: Uniswap.address,
    network: {
      name: Uniswap.provider._network.name,
      chainId: Uniswap.provider._network.chainId,
    },
    abi: JSON.parse(Uniswap.interface.format("json")),
  };
  fs.writeFileSync(
    "Build/Uniswap.json",
    JSON.stringify(UniswapData, null, "\t")
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
