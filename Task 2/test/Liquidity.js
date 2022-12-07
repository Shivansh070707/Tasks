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
  describe("liquidity", function () {
    it("should add liquidity", async function () {
      await Gold.connect(owner).approve(Add.address, 100000000);
      await Silver.connect(owner).approve(Add.address, 1500000000);
      const tx = await Add.connect(owner).addLiquidity(10000, 150000);
      const tx_receipt = await tx.wait();
      //console.log(tx_receipt);
      const liquidity = tx_receipt.events[15].args[2].toNumber();
      const balance = await Add.connect(owner).getLiquidityBalance(
        Gold.address,
        Silver.address
      );
      expect(liquidity).to.equal(balance.toNumber());
      //const events = await Add.queryFilter("AddLiquidity", 14390010, 14390020);
      //console.log(events);
    });
    it("should remove liquidity", async function () {
      await Gold.connect(owner).approve(Add.address, 100000000);
      await Silver.connect(owner).approve(Add.address, 1500000000);
      await Add.connect(owner).addLiquidity(10000, 150000);
      let g1 = await Gold.balanceOf(owner.address);
      let s1 = await Silver.balanceOf(owner.address);

      const pair = await Add.getPair(Gold.address, Silver.address);

      const Pair = await ethers.getContractAt("IERC20_", pair);
      console.log(Pair.address);
      await Pair.connect(owner).approve(Add.address, 1000);
      const before = await Pair.balanceOf(owner.address);

      const tx = await Add.connect(owner).removeLiquidity(
        Gold.address,
        Silver.address,
        1000
      );
      const tx_receipt = await tx.wait();
      // console.log(tx_receipt);

      const after = await Pair.balanceOf(owner.address);
      let g2 = await Gold.balanceOf(owner.address);
      let s2 = await Silver.balanceOf(owner.address);
      const a1 = tx_receipt.events[10].args[0].toNumber();
      const a2 = tx_receipt.events[10].args[1].toNumber();
      const liquidity = tx_receipt.events[10].args[2].toNumber();

      expect(before - after).to.equal(liquidity);
      expect(g2 - g1).to.equal(a1);
      expect(s2 - s1).to.equal(a2);
    });
  });
});
