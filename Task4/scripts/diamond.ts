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

  let x = await deployDiamond();

  diamondAddress = x.diamondAddress;

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
    'StratX2Settings',
    diamondAddress
  );
  stratx2getter = await ethers.getContractAt('StratX2Getter', diamondAddress);
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
