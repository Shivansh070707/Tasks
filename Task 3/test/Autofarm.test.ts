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
    pool,
    want: IERC20,
    autoV21,
    reward;
  before(async function () {
    // Using Address of ethereum whale
    const address = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [address],
    });

    owner = ethers.provider.getSigner(address);

    [reward, otherAccount] = await ethers.getSigners();

    //Deploying Tokens
    const MATIC = await ethers.getContractFactory("Matic");
    matic = await MATIC.connect(owner).deploy();

    const BITCOIN = await ethers.getContractFactory("Bitcoin");
    bitcoin = await BITCOIN.connect(owner).deploy();

    const ADA = await ethers.getContractFactory("Cardano");
    ada = await ADA.connect(owner).deploy();

    const XRP = await ethers.getContractFactory("XRP");
    xrp = await XRP.connect(owner).deploy();

    /* Deploying Auto V2 contract
    autoV2 is used as a native token for autofarmA
    autov21 is used as native tokrn for autofarmB
    */

    const AUTOV2 = await ethers.getContractFactory("AUTOv2");
    autoV2 = await AUTOV2.connect(owner).deploy();
    autoV21 = await AUTOV2.connect(owner).deploy();

    /*
    deploying autofarm contracts
    */
    const AUTOFARM = await ethers.getContractFactory("AutoFarmV2");
    farmA = await AUTOFARM.connect(owner).deploy(autoV2.address);
    farmB = await AUTOFARM.connect(owner).deploy(autoV21.address);

    /*
    Transferring ownership to respective autofarm addresses,
    After transferring only autofarm contract is able to mint tokens.
    */
    await autoV2.connect(owner).transferOwnership(farmA.address);
    await autoV21.connect(owner).transferOwnership(farmB.address);

    /*
    Deploying Lp pool for creating lp-pair
    */

    const LP_POOL = await ethers.getContractFactory("Liquidity");
    pool = await LP_POOL.connect(owner).deploy();
    /*
    Approving Pool address various tokens 
    */
    await matic
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("100"));
    await bitcoin
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("150"));
    await autoV21
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("100"));
    await ada
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("150"));
    await xrp
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("150"));

    await autoV2
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("100"));
    await autoV21
      .connect(owner)
      .approve(pool.address, ethers.utils.parseEther("100"));
    /*
    Creating LP-Pair of Various Tokens
    */
    await pool
      .connect(owner)
      .addLiquidity(
        autoV21.address,
        bitcoin.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        autoV21.address,
        matic.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        matic.address,
        bitcoin.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );

    await pool
      .connect(owner)
      .addLiquidity(
        bitcoin.address,
        autoV2.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        xrp.address,
        ada.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        matic.address,
        bitcoin.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        bitcoin.address,
        autoV21.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        matic.address,
        xrp.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );
    await pool
      .connect(owner)
      .addLiquidity(
        xrp.address,
        bitcoin.address,
        ethers.utils.parseUnits("10", "ether"),
        ethers.utils.parseUnits("15", "ether")
      );

    // want is lp pair of matic and bitcoin
    const wantaddress = await pool.getPair(matic.address, bitcoin.address);
    want = await ethers.getContractAt("IERC20", wantaddress);
    /*
    Deploying Strat A contract
    -Pid should of stratA and poolInfo[pid] of farmB should be same
    -Autocompounding is true ,so the earned address will be the native token of farmB i.e autoV21
     */
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
        autoV21.address,
        farmB.address,
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        reward.address,
        "0x000000000000000000000000000000000000dEaD",
      ],
      0,
      false,
      false,
      true,
      [autoV21.address, bitcoin.address, autoV2.address],
      [autoV21.address, matic.address],
      [autoV21.address, bitcoin.address],
      [matic.address, autoV21.address],
      [bitcoin.address, autoV21.address],
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
        xrp.address,
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
    pool address =${pool.address};
    want address =${want.address};
    reward address =${reward.address};
    owner want balance =${await want.balanceOf(owner._address)}
    xrp balance after ${await xrp.balanceOf(owner._address)};

    
    `);
  });

  describe("Autofarm V2", () => {
    it("should pool new pool in Both Farms", async () => {
      // Adding First Pool in Both the farms
      await farmA.connect(owner).add(1, want.address, false, stratA.address);
      await farmB.connect(owner).add(1, want.address, false, stratB.address);
      expect(await farmB.poolLength()).to.equal(1);
      expect(await farmA.poolLength()).to.equal(1);
      //console.log(await farmA.poolInfo(0));
    });
    it("Should deposit want tokens in farmA and want tokens will be stored in FarmB", async () => {
      //Approving want tokens to farm address
      await want
        .connect(owner)
        .approve(farmA.address, ethers.utils.parseUnits("10", "ether"));

      //depositing want tokens
      await expect(
        farmA.connect(owner).deposit(0, ethers.utils.parseEther("10"))
      ).to.changeTokenBalances(
        want,
        [owner._address, stratB.address],
        [ethers.utils.parseEther("-10"), ethers.utils.parseEther("10")]
      );
    });
    it("Should withdraw want tokens and that tokens will be transferred to user", async () => {
      await expect(
        farmA.connect(owner).withdraw(0, ethers.utils.parseUnits("1", "ether"))
      ).to.changeTokenBalances(
        want,
        [owner._address, stratB.address],
        [ethers.utils.parseEther("1"), ethers.utils.parseEther("-1")]
      );
    });
    it("Should Withdraw want token and after withdrawing ,user will get some autoV21 tokens", async () => {
      let currentBlockTime = await time.latest();
      let one_day = currentBlockTime + 24 * 60 * 60;
      await time.increaseTo(one_day);
      let earn_balance_before = await autoV21.balanceOf(owner._address);

      await farmA
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits("1", "ether"));
      let earn_balance_after = await autoV21.balanceOf(owner._address);

      expect(earn_balance_after - earn_balance_before).to.be.greaterThan(0);
    });
  });
  describe("Strat_PCS", () => {
    it("Run earn and autocompound want tokens", async () => {
      /*
    Increasing blocktime to one year
     */
      const currentBlockTime = await time.latest();
      const one_year = currentBlockTime + 365 * 24 * 60 * 60;
      await time.increaseTo(one_year);

      let want_before = await want.balanceOf(stratB.address);
      await stratA.connect(owner).earn();
      let want_after = await want.balanceOf(stratB.address);
      expect(want_after - want_before).to.be.greaterThan(0);
    });
    it("Should convert dust to earn Tokens", async () => {
      let earn_before = await autoV21.balanceOf(stratA.address);
      await stratA.convertDustToEarned();
      let earn_after = await autoV21.balanceOf(stratA.address);

      expect(earn_after - earn_before).to.be.greaterThan(0);
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
