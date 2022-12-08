const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Liquidity", function () {
  let gold, silver, add, owner, otherAccount;
  before(async function () {
    const address = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [address],
    });

    owner = ethers.provider.getSigner(address);

    [otherAccount] = await ethers.getSigners();

    const GOLD = await ethers.getContractFactory("Gold");
    gold = await GOLD.connect(owner).deploy();

    const SILVER = await ethers.getContractFactory("Silver");
    silver = await SILVER.connect(owner).deploy();

    const ADD = await ethers.getContractFactory("Liquidity");
    add = await ADD.connect(owner).deploy(silver.address, gold.address);
  });
  it("should return owner address", async () => {
    expect(owner._address).to.equal(
      "0xF977814e90dA44bFA03b6295A0616a897441aceC"
    );
  });
  it("should fetch owner balance", async function () {
    expect(await gold.balanceOf(owner._address)).to.equal(10000000000000);
    expect(await silver.balanceOf(owner._address)).to.equal(10000000000000);
  });
  describe("liquidity", function () {
    it("should add liquidity", async function () {
      await gold.connect(owner).approve(add.address, 100000000);
      await silver.connect(owner).approve(add.address, 1500000000);
      const tx = await add.connect(owner).addLiquidity(10000, 150000);
      const tx_receipt = await tx.wait();

      const liquidity = tx_receipt.events[15].args[2].toNumber();
      const balance = await add
        .connect(owner)
        .getLiquidityBalance(gold.address, silver.address);
      expect(liquidity).to.equal(balance.toNumber());
    });
    it("should remove liquidity", async function () {
      let g1 = await gold.balanceOf(owner._address);
      let s1 = await silver.balanceOf(owner._address);

      const pair = await add.getPair(gold.address, silver.address);

      const Pair = await ethers.getContractAt("IERC20", pair);
      console.log(Pair.address);
      await Pair.connect(owner).approve(add.address, 100000000);
      const before = await Pair.balanceOf(owner._address);

      const tx = await add
        .connect(owner)
        .removeLiquidity(gold.address, silver.address, 1000);
      const tx_receipt = await tx.wait();
      //console.log(tx_receipt);

      const after = await Pair.balanceOf(owner._address);
      let g2 = await gold.balanceOf(owner._address);
      let s2 = await silver.balanceOf(owner._address);
      const a1 = tx_receipt.events[8].args[0].toNumber();
      const a2 = tx_receipt.events[8].args[1].toNumber();
      const liquidity = tx_receipt.events[8].args[2].toNumber();

      expect(before - after).to.equal(liquidity);
      expect(g2 - g1).to.equal(a1);
      expect(s2 - s1).to.equal(a2);
    });
  });
  describe("Errors", function () {
    it("should revert if balance is less than liquidity amount", async function () {
      await expect(
        add
          .connect(owner)
          .removeLiquidity(gold.address, silver.address, 1000000)
      ).to.be.revertedWith("Insufficient Liquidity");
    });
  });
});
