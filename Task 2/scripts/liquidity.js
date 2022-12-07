const { ethers } = require("hardhat");
const gold = require("../Build/Gold.json");
const silver = require("../Build/Silver.json");
const uniswap = require("../Build/Uniswap.json");

async function main() {
  const Gold = await ethers.getContractAt(gold.abi, gold.address);

  const Silver = await ethers.getContractAt(silver.abi, silver.address);

  const Add = await ethers.getContractAt(uniswap.abi, uniswap.address);

  await Gold.approve(Add.address, 100000000);
  await Silver.approve(Add.address, 1500000000);
  const tx = await Add.addLiquidity(10000, 150000);
  const tx_receipt = await tx.wait();

  console.log(` ${tx_receipt.events[14].args[2].toNumber()} Added Liquidity `);
  const pair = await Add.getPair(Gold.address, Silver.address);
  const Pair = await ethers.getContractAt("IERC20_", pair);
  console.log(Pair.address);
  await Pair.approve(Add.address, 1000);

  const tx1 = await Add.removeLiquidity(Gold.address, Silver.address, 1000);
  const tx1_receipt = await tx1.wait();

  const liquidity = tx1_receipt.events[10].args[2].toNumber();
  console.log(`${liquidity} liquidity burned`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
