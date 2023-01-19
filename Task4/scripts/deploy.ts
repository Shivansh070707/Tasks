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
import * as fs from 'fs';
// if (!fs.existsSync('Build')) {
//   fs.mkdir('Build', (err) => {
//     console.log('File created');
//   });

fs.mkdir('Build', (err) => {
  console.log('File created');
});
// }

export async function deployDiamond() {
  let data = await main();
  let matic: Contract | IERC20 = data.matic;
  let bitcoin: Contract | IERC20 = data.bitcoin;
  let autoV2: Contract = data.autoV2;
  let farmA: Contract | AutoFarmV2 = data.farmA;
  let farmB: Contract | AutoFarmV2 = data.farmB;
  let owner = data.owner;
  let stratA: Contract | StratX2 = data.stratA;
  let stratB: Contract | StratX2 = data.stratB;
  let want: Contract | IERC20 = data.want;
  let autoV21: Contract | IERC20 = data.autoV21;
  let [reward, otherAccount] = await ethers.getSigners();

  console.log('**** Deploying diamond ...');
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();

  let diamondCutFacetData = {
    address: diamondCutFacet.address,
    network: {
      name: diamondCutFacet.provider._network.name,
      chainId: diamondCutFacet.provider.network.chainId,
    },
    abi: JSON.parse(diamondCutFacet.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/DiamondCutFacet.json',
    JSON.stringify(diamondCutFacetData, null, 2)
  );

  console.log('DiamondCutFacet deployed at: ', diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('Diamond');
  const diamond = await Diamond.deploy(owner.address, diamondCutFacet.address);
  await diamond.deployed();

  let diamondFacetData = {
    address: diamond.address,
    network: {
      name: diamond.provider._network.name,
      chainId: diamond.provider.network.chainId,
    },
    abi: JSON.parse(diamond.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/Diamond.json',
    JSON.stringify(diamondFacetData, null, 2)
  );

  console.log('Diamond deployed at: ', diamond.address);

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  let diamondInitFacetData = {
    address: diamondInit.address,
    network: {
      name: diamondInit.provider._network.name,
      chainId: diamondInit.provider.network.chainId,
    },
    abi: JSON.parse(diamondInit.interface.format('json')),
  };
  fs.writeFileSync(
    'Build/DiamondInit.json',
    JSON.stringify(diamondInitFacetData, null, 2)
  );
  console.log('DiamondInit deployed at: ', diamondInit.address);
  // deploy facets
  // console.log("Deploying facets");
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'StratX2SetterFacet',
    'StratX2Facet',
    'StratX2GetterFacet',
  ];
  const cut = [];
  let fileData = [];
  for (const facetName of FacetNames) {
    const Facet = await ethers.getContractFactory(facetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    fileData.push({
      address: facet.address,
      network: {
        name: facet.provider._network.name,
        chainId: facet.provider.network.chainId,
      },
      abi: JSON.parse(facet.interface.format('json')),
    });

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
  const diamondInitFunctionCall = diamondInit.interface.encodeFunctionData(
    'init',
    [
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
    ]
  );

  const tx = await diamondCut
    .connect(owner)
    .diamondCut(cut, diamondInit.address, diamondInitFunctionCall);

  // console.log("Diamond cut tx: ", tx.hash);
  const receipt = await tx.wait();
  // console.log("returned status: ", receipt);
  if (!receipt.status) throw Error(`Diamond upgrade failed: ${tx.hash}`);

  let diamondAddress: string = diamond.address;
  await farmA.connect(owner).add(1, want.address, false, stratA.address);
  await farmB.connect(owner).add(1, want.address, false, stratB.address);

  let DiamondLoupeFacetData = {
    fileData: fileData[0],
  };
  fs.writeFileSync(
    'Build/DiamondLoupeFacet.json',
    JSON.stringify(DiamondLoupeFacetData, null, 2)
  );

  let StratX2SetterData = {
    fileData: fileData[2],
  };
  fs.writeFileSync(
    'Build/StratX2Setter.json',
    JSON.stringify(StratX2SetterData, null, 2)
  );
  let StratX2FacetData = {
    fileData: fileData[3],
  };
  fs.writeFileSync(
    'Build/StratX2Facet.json',
    JSON.stringify(StratX2FacetData, null, 2)
  );

  let StratX2GetterData = {
    fileData: fileData[4],
  };
  fs.writeFileSync(
    'Build/StratX2GetterFacet.json',
    JSON.stringify(StratX2GetterData, null, 2)
  );

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
