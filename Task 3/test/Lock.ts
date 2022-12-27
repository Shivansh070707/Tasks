import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Test", function () {
  let matic,
    bitcoin,
    autoV2,
    farmA,
    farmB,
    owner,
    otherAccount,
    stratA,
    add,
    want,
    reward;
  before(async function () {
    const address = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [address],
    });

    owner = ethers.provider.getSigner(address);

    [reward, otherAccount] = await ethers.getSigners();

    const MATIC = await ethers.getContractFactory("Matic");
    matic = await MATIC.connect(owner).deploy();

    const BITCOIN = await ethers.getContractFactory("Bitcoin");
    bitcoin = await BITCOIN.connect(owner).deploy();

    const AUTOV2 = await ethers.getContractFactory("AUTOv2");
    autoV2 = await AUTOV2.connect(owner).deploy();

    const FARMA = await ethers.getContractFactory("AutoFarmV2");
    farmA = await FARMA.connect(owner).deploy(autoV2.address);

    const FARMB = await ethers.getContractFactory("AutoFarmV2");
    farmB = await FARMB.connect(owner).deploy(autoV2.address);

    const ADD = await ethers.getContractFactory("Liquidity");
    add = await ADD.connect(owner).deploy();
    await matic
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("100000000"));
    await bitcoin
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("1500000000"));
    const tx = await add
      .connect(owner)
      .addLiquidity(matic.address, bitcoin.address, 10000, 150000);
    const tx_receipt = await tx.wait();

    const wantaddress = await add.getPair(matic.address, bitcoin.address);
    want = await ethers.getContractAt("IERC20", wantaddress);

    const StratA = await ethers.getContractFactory("StratX2_PCS");
    stratA = await StratA.connect(owner).deploy(
      [
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        owner._address,
        farmA.address,
        autoV2.address,
        want.address,
        matic.address,
        bitcoin.address,
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        farmB.address,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        reward.address,
        "0x000000000000000000000000000000000000dEaD",
      ],
      0,
      false,
      false,
      true,
      [],
      [],
      [],
      [],
      [],
      70,
      150,
      9990,
      10000
    );
  });
  describe("autofarm V2", () => {
    it("should add new pool", async () => {
      await farmA.connect(owner).add(200, want.address, false, stratA.address);
      expect(await farmA.poolLength()).to.equal(1);
    });
    it("should deposit want tokens", async () => {
      await want.connect(owner).approve(farmA.address, 10);
      await farmA.connect(owner).deposit(0, 10);
    });
  });
});

// Sumit Guha
// :knife_fork_plate:  4:30 PM
// ["0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "Timelock address",
// "Farm address",
// "Farmtoken address",
// "0x7efaef62fddcca950418312c6c91aef321375a00",//want
// "0x55d398326f99059ff775485246999027b3197955",//token0
// "0xe9e7cea3dedca5984780bafc599bd69add087d56",//token1
// "0xa184088a740c695e156f91f5cc086a06bb78b827",//earned
// "0x0895196562c7868c5be92459fae7f877ed450452",//farmcontractaddress
// "0x10ed43c718714eb63d5aa57b78b54704e256024e",//unirouteraddress
// "Timelock address",//rewardaddress
// "0x000000000000000000000000000000000000dead"],//buybackaddress
// 248,
// false,
// false,
// true,
// ["0xa184088a740c695e156f91f5cc086a06bb78b827",
// "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "FarmToken address"],
// ["0xa184088a740c695e156f91f5cc086a06bb78b827",
// "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "0x55d398326f99059fF775485246999027B3197955"],
// ["0xa184088a740c695e156f91f5cc086a06bb78b827",
// "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"],
// ["0x55d398326f99059fF775485246999027B3197955",
// "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "0xa184088a740c695e156f91f5cc086a06bb78b827"],
// ["0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
// "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
// "0xa184088a740c695e156f91f5cc086a06bb78b827"],
// 70,
// 150,
// 9990,
10000;
