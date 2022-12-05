const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Liquidity", function () {
  let Gold, Silver, Add, owner, otherAccount;
  beforeEach(async function () {
    const address = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    await helpers.impersonateAccount(address);
    owner = await ethers.getSigner(address);

    [otherAccount] = await ethers.getSigners();

    const GOLD = await ethers.getContractFactory("Gold");
    Gold = await GOLD.connect(owner).deploy();

    const SILVER = await ethers.getContractFactory("Silver");
    Silver = await SILVER.connect(owner).deploy();

    const ADD = await ethers.getContractFactory("UniswapV2SwapExamples");
    Add = await ADD.connect(owner).deploy(Silver.address, Gold.address);
  });
  it("should return owner address", async () => {
    expect(owner.address).to.equal(
      "0xF977814e90dA44bFA03b6295A0616a897441aceC"
    );
  });
  it("should fetch owner balance", async function () {
    expect(await Gold.balanceOf(owner.address)).to.equal(10000000000000);
    expect(await Silver.balanceOf(owner.address)).to.equal(10000000000000);
  });
  it("should add liquidity", async function () {
    await Gold.connect(owner).approve(Add.address, 100000000);
    await Silver.connect(owner).approve(Add.address, 1500000000);
    const tx = await Add.connect(owner).addLiquidity(10000, 150000);
    const tx_receipt = await tx.wait();
    console.log(tx_receipt.events[0].args);
    // const events = await Add.queryFilter("Mint", 14390010, 14390020);
    // console.log(events);
  });
});
