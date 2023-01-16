// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from 'hardhat';
import { getSelectorsFromContract, FacetCutAction } from './libraries';
import { main } from '../scripts/helpers/token';
import { Contract } from 'ethers';
import { AutoFarmV2, StratX2, IERC20 } from '../typechain-types';

export async function deployDiamond() {
  let x = await main();
  let matic: Contract | IERC20 = x.matic;
  let bitcoin: Contract | IERC20 = x.bitcoin;
  let autoV2: Contract = x.autoV2;
  let farmA: Contract | AutoFarmV2 = x.farmA;
  let farmB: Contract | AutoFarmV2 = x.farmB;
  let owner = x.owner;
  let stratA: Contract | StratX2 = x.stratA;
  let stratB: Contract | StratX2 = x.stratB;
  let want: Contract | IERC20 = x.want;
  let autoV21: Contract | IERC20 = x.autoV21;
  let [reward, otherAccount] = await ethers.getSigners();

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  // We get the contract to deploy

  console.log('**** Deploying diamond ...');

  const address = '0xF977814e90dA44bFA03b6295A0616a897441aceC';
  // await network.provider.request({
  //   method: 'hardhat_impersonateAccount',
  //   params: [address],
  // });

  // owner = await ethers.getSigner(address);

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond = await Diamond.deploy(owner.address, diamondCutFacet.address);
  await diamond.deployed();

  console.log('Diamond deployed at: ', diamond.address);

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  console.log('DiamondInit deployed at: ', diamondInit.address);
  // deploy facets
  // console.log("Deploying facets");
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'StratX2Setter',
    'StratX2Facet',
    'StratX2Getter',
  ];
  const cut = [];
  for (const facetName of FacetNames) {
    const Facet = await ethers.getContractFactory(facetName);
    const facet = await Facet.deploy();
    await facet.deployed();

    console.log(`${facetName} deployed at ${facet.address}`);

    const selectors = getSelectorsFromContract(facet);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: selectors.getSelectors(),
    });
  }

  //console.log('Diamond Cut: ', cut);
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address);
  const functionCall = diamondInit.interface.encodeFunctionData('init', [
    [
      '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      owner.address,
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
    [70, 150, 9990, 10000],
  ]);

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cut, diamondInit.address, functionCall);

  // console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  // console.log("returned status: ", receipt);
  if (!receipt.status) throw Error(`Diamond upgrade failed: ${tx.hash}`);

  let diamondAddress: string = diamond.address;
  await farmA.connect(owner).add(1, want.address, false, stratA.address);
  await farmB.connect(owner).add(1, want.address, false, stratB.address);

  console.log('**** Diamond deploy end');
  return {
    matic,
    bitcoin,

    autoV2,
    farmA,
    farmB,
    owner,
    otherAccount,
    stratA,
    stratB,

    want,
    autoV21,
    reward,
    diamondAddress,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => console.log('deployment success'))
    .catch((error) => {
      console.error(error);
    });
}
