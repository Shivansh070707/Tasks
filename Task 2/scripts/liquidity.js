const { ethers } = require("hardhat");
const Gold = require("../Build/Gold.json");
const Silver = require("../Build/Silver.json");
const Uniswap = require("../Build/Uniswap.json");

async function main() {
  const gold = await ethers.getContractAt(Gold.abi, Gold.address);

  const silver = await ethers.getContractAt(Silver.abi, Silver.address);

  const add = await ethers.getContractAt(Uniswap.abi, Uniswap.address);

  await gold.approve(add.address, ethers.utils.parseEther("100000000"));
  await silver.approve(add.address, ethers.utils.parseEther("1500000000"));
  const tx = await add.addLiquidity(10000, 150000);
  const tx_receipt = await tx.wait();

  console.log(` ${tx_receipt.events[14].args[2].toNumber()} Added Liquidity `);
  const pair = await add.getPair(gold.address, silver.address);
  const Pair = await ethers.getContractAt("IERC20", pair);
  console.log(Pair.address);
  await Pair.approve(add.address, 1000);

  const tx1 = await add.removeLiquidity(gold.address, silver.address, 1000);
  const tx1_receipt = await tx1.wait();

  const liquidity = tx1_receipt.events[10].args[2].toNumber();
  console.log(`${liquidity} liquidity burned`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
