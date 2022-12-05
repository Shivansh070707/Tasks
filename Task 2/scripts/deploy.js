const { hre } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
async function main() {
  const address = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
  await helpers.impersonateAccount(address);
  const whale = await ethers.getSigner(address);

  const LOCK = await ethers.getContractFactory;
}
