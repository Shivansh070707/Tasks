import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { AutoFarmV2, StratX2, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Test", function () {
  let matic,
    bitcoin,
    ada,
    xrp,
    autoV2,
    farmA: AutoFarmV2,
    farmB: AutoFarmV2,
    owner,
    otherAccount,
    stratA: StratX2,
    stratB: StratX2,
    add,
    want: IERC20,
    earned,
    autoV21,
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

    const ADA = await ethers.getContractFactory("Cardano");
    ada = await ADA.connect(owner).deploy();

    const XRP = await ethers.getContractFactory("XRP");
    xrp = await XRP.connect(owner).deploy();

    const AUTOV2 = await ethers.getContractFactory("AUTOv2");
    autoV2 = await AUTOV2.connect(owner).deploy();
    const AUTOV21 = await ethers.getContractFactory("AUTOv2");
    autoV21 = await AUTOV2.connect(owner).deploy();

    const FARMA = await ethers.getContractFactory("AutoFarmV2");
    farmA = await FARMA.connect(owner).deploy(autoV2.address);

    const FARMB = await ethers.getContractFactory("AutoFarmV2");
    farmB = await FARMB.connect(owner).deploy(autoV21.address);
    await autoV2.connect(owner).transferOwnership(farmA.address);
    await autoV21.connect(owner).transferOwnership(farmB.address);

    const ADD = await ethers.getContractFactory("Liquidity");

    add = await ADD.connect(owner).deploy();
    await matic
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("100000000"));
    await bitcoin
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("1500000000"));
    await xrp
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("100000000"));
    await ada
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("1500000000"));

    // await autoV2
    //   .connect(owner)
    //   .mint(owner._address, ethers.utils.parseEther("10"));
    await autoV2
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("100000000"));
    await autoV21
      .connect(owner)
      .approve(add.address, ethers.utils.parseEther("100000000"));

    await add
      .connect(owner)
      .addLiquidity(
        xrp.address,
        bitcoin.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        xrp.address,
        matic.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        matic.address,
        bitcoin.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );

    await add
      .connect(owner)
      .addLiquidity(
        bitcoin.address,
        autoV2.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        xrp.address,
        ada.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        matic.address,
        bitcoin.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        bitcoin.address,
        autoV21.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        matic.address,
        xrp.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );
    await add
      .connect(owner)
      .addLiquidity(
        xrp.address,
        bitcoin.address,
        ethers.utils.parseUnits("10000", "ether"),
        ethers.utils.parseUnits("15000", "ether")
      );

    // want is lp pair of matic and bitcoin
    const wantaddress = await add.getPair(matic.address, bitcoin.address);
    want = await ethers.getContractAt("IERC20", wantaddress);

    const earnaddress = await add.getPair(ada.address, xrp.address);
    earned = await ethers.getContractAt("IERC20", earnaddress);

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
        xrp.address,
        farmB.address,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        reward.address,
        "0x000000000000000000000000000000000000dEaD",
      ],
      0,
      false,
      false,
      true,
      [xrp.address, bitcoin.address, autoV2.address],
      [xrp.address, matic.address],
      [xrp.address, bitcoin.address],
      [matic.address, xrp.address],
      [bitcoin.address, xrp.address],
      70,
      150,
      9990,
      10000
    );
    const StratB = await ethers.getContractFactory("StratX2_PCS");
    stratB = await StratB.connect(owner).deploy(
      [
        "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
        owner._address,
        farmB.address,
        autoV21.address,
        want.address,
        matic.address,
        bitcoin.address,
        xrp.address,
        farmA.address,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        reward.address,
        "0x000000000000000000000000000000000000dEaD",
      ],
      0,
      false,
      false,
      false,
      [xrp.address, bitcoin.address, autoV21.address],
      [xrp.address, matic.address],
      [xrp.address, bitcoin.address],
      [matic.address, xrp.address],
      [bitcoin.address, xrp.address],
      70,
      150,
      9990,
      10000
    );
    await stratA.deployed();
    console.log(`

    matic address = ${matic.address};
    bitcoin address= ${bitcoin.address};
    ada address=${ada.address};
    xrp address =${xrp.address}
    autoV2 address =${autoV2.address},
    farmA address =${farmA.address};
    farmB address =${farmB.address};
    owner address =${owner._address};
    otherAccount address =${otherAccount.address};
    stratA address =${stratA.address};
    stratB address =${stratB.address};
    add address =${add.address};
    want address =${want.address};
    earned address =${earned.address};
    reward address =${reward.address};
    owner want balance =${await want.balanceOf(owner._address)}

    
    `);
  });

  describe("autofarm V2", () => {
    it("should add new pool", async () => {
      await farmA.connect(owner).add(1, want.address, false, stratA.address);
      await farmB.connect(owner).add(1, want.address, false, stratB.address);
      expect(await farmA.poolLength()).to.equal(1);
    });
    it("should deposit want tokens", async () => {
      await want
        .connect(owner)
        .approve(farmA.address, ethers.utils.parseUnits("1000", "ether"));
      await farmA
        .connect(owner)
        .deposit(0, ethers.utils.parseUnits("1000", "ether"));

      // await expect(
      //   farmA.connect(owner).deposit(0, 1000)
      // ).to.changeTokenBalances(
      //   want,
      //   [owner._address, stratB.address],
      //   [-1000, 1000]
      // );
    });
    it("should withdraw want tokens", async () => {
      const currentBlockTime = await time.latest();
      const one_year = currentBlockTime + 365 * 24 * 60 * 60;

      await time.increaseTo(one_year);
      await stratA.connect(owner).earn();
      // await expect(farmA.connect(owner).withdraw(0, 50)).to.changeTokenBalances(
      //   want,
      //   [owner._address, stratB.address],
      //   [50, -50]
      // );
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
