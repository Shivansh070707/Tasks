import { ethers, network } from 'hardhat';
import { AutoFarmV2, StratX2, IERC20 } from '../typechain-types';

export async function main() {
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
  const address = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });

  owner = ethers.provider.getSigner(address);

  [reward, otherAccount] = await ethers.getSigners();

  //Deploying Tokens
  const MATIC = await ethers.getContractFactory('Matic');
  matic = await MATIC.connect(owner).deploy();

  const BITCOIN = await ethers.getContractFactory('Bitcoin');
  bitcoin = await BITCOIN.connect(owner).deploy();

  const ADA = await ethers.getContractFactory('Cardano');
  ada = await ADA.connect(owner).deploy();

  const XRP = await ethers.getContractFactory('XRP');
  xrp = await XRP.connect(owner).deploy();

  /* Deploying Auto V2 contract
    autoV2 is used as a native token for autofarmA
    autov21 is used as native tokrn for autofarmB
    */

  const AUTOV2 = await ethers.getContractFactory('AUTOv2');
  autoV2 = await AUTOV2.connect(owner).deploy();
  autoV21 = await AUTOV2.connect(owner).deploy();

  /*
    deploying autofarm contracts
    */
  const AUTOFARM = await ethers.getContractFactory('AutoFarmV2');
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

  const LP_POOL = await ethers.getContractFactory('Liquidity');
  pool = await LP_POOL.connect(owner).deploy();
  /*
    Approving Pool address various tokens 
    */
  await matic
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await bitcoin
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));
  await autoV21
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await ada
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));
  await xrp
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('150'));

  await autoV2
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  await autoV21
    .connect(owner)
    .approve(pool.address, ethers.utils.parseEther('100'));
  /*
    Creating LP-Pair of Various Tokens
    */
  await pool
    .connect(owner)
    .addLiquidity(
      autoV21.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      autoV21.address,
      matic.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );

  await pool
    .connect(owner)
    .addLiquidity(
      bitcoin.address,
      autoV2.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      xrp.address,
      ada.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      bitcoin.address,
      autoV21.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      matic.address,
      xrp.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );
  await pool
    .connect(owner)
    .addLiquidity(
      xrp.address,
      bitcoin.address,
      ethers.utils.parseUnits('10', 'ether'),
      ethers.utils.parseUnits('15', 'ether')
    );

  // want is lp pair of matic and bitcoin
  const wantaddress = await pool.getPair(matic.address, bitcoin.address);
  want = await ethers.getContractAt('IERC20', wantaddress);
  /*
    Deploying Strat A contract
    -Pid should of stratA and poolInfo[pid] of farmB should be same
    -Autocompounding is true ,so the earned address will be the native token of farmB i.e autoV21
     */
  const StratA = await ethers.getContractFactory('StratX2_PCS');
  stratA = await StratA.connect(owner).deploy(
    [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      owner._address,
      farmA.address,
      autoV2.address,
      want.address,
      matic.address,
      bitcoin.address,
      autoV21.address,
      farmB.address,
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      reward.address,
      '0x000000000000000000000000000000000000dEaD',
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
  const StratB = await ethers.getContractFactory('StratX2_PCS');
  stratB = await StratB.connect(owner).deploy(
    [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      owner._address,
      farmB.address,
      xrp.address,
      want.address,
      matic.address,
      bitcoin.address,
      xrp.address,
      farmA.address,
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      reward.address,
      '0x000000000000000000000000000000000000dEaD',
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
  // Adding First Pool in Both the farms
  await farmA.connect(owner).add(1, want.address, false, stratA.address);
  await farmB.connect(owner).add(1, want.address, false, stratB.address);
  //Approving want tokens to farm address
  await want
    .connect(owner)
    .approve(farmA.address, ethers.utils.parseUnits('10', 'ether'));
  console.log('don');
  return {
    matic,
    bitcoin,
    ada,
    xrp,
    autoV2,
    farmA,
    farmB,
    owner,
    otherAccount,
    stratA,
    stratB,
    pool,
    want,
    autoV21,
    reward,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
