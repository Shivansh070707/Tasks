import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { deployDiamond } from '../scripts/deploy';
import { DiamondCutFacet, DiamondLoupeFacet } from '../typechain-types';

export async function deploy() {
  let diamondAddress: string;
  let diamondCutFacet: Contract | DiamondCutFacet;
  let diamondLoupeFacet: Contract | DiamondLoupeFacet;
  let stratx2: Contract;
  let stratx2Settings: Contract;
  let stratx2getter: Contract;

  let data = await deployDiamond();

  diamondAddress = data.diamondAddress;

  diamondCutFacet = await ethers.getContractAt(
    'DiamondCutFacet',
    diamondAddress
  );
  diamondLoupeFacet = await ethers.getContractAt(
    'DiamondLoupeFacet',
    diamondAddress
  );

  stratx2 = await ethers.getContractAt('StratX2Facet', diamondAddress);
  stratx2Settings = await ethers.getContractAt(
    'StratX2SetterFacet',
    diamondAddress
  );
  stratx2getter = await ethers.getContractAt(
    'StratX2GetterFacet',
    diamondAddress
  );
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
