import { assert, expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { deployDiamond } from '../scripts/deploy';
import { FacetCutAction, getSelectorsFromContract } from '../scripts/libraries';
import {
  DiamondCutFacet,
  DiamondLoupeFacet,
  AutoFarmV2,
  StratX2,
  IERC20,
} from '../typechain-types';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('Test', () => {
  let diamondAddress: string;
  let diamondCutFacet: Contract | DiamondCutFacet;
  let diamondLoupeFacet: Contract | DiamondLoupeFacet;
  let stratx2: Contract;
  let stratx2Settings: Contract;
  let stratx2getter: Contract;
  let OwnershipFacet: Contract;
  let farmA: Contract | AutoFarmV2;
  let owner: any;
  let stratB: Contract | StratX2;
  let want: Contract | IERC20;
  let autoV21: Contract | IERC20;

  let facetAddresses: string[]; // DiamondCutFacet, DiamondLoupeFacet, StratX2Facet

  before(async () => {
    let x = await deployDiamond();
    farmA = x.farmA;
    stratB = x.stratB;
    want = x.want;
    autoV21 = x.autoV21;
    owner = x.owner;
    diamondAddress = x.diamondAddress;

    diamondCutFacet = await ethers.getContractAt(
      'DiamondCutFacet',
      diamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      'DiamondLoupeFacet',
      diamondAddress
    );
    OwnershipFacet = await ethers.getContractAt(
      'OwnershipFacet',
      diamondAddress
    );

    stratx2 = await ethers.getContractAt('StratX2Facet', diamondAddress);
    stratx2Settings = await ethers.getContractAt(
      'StratX2Settings',
      diamondAddress
    );
    stratx2getter = await ethers.getContractAt('StratX2Getter', diamondAddress);
  });

  describe('test - diamond', () => {
    it('should have 6 facets -- call to facetAddresses', async () => {
      facetAddresses = await diamondLoupeFacet.facetAddresses();
      console.log(facetAddresses);

      assert(facetAddresses.length === 6);
    });

    it('should have the right function selectors -- call to faceFunctionSelectors', async () => {
      let selectors, result;

      // test for DiamondCutFacet
      selectors = getSelectorsFromContract(diamondCutFacet).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[0]
      );
      assert.sameMembers(result, selectors);

      // test for DiamondLoupeFacet
      selectors = getSelectorsFromContract(diamondLoupeFacet).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[1]
      );
      assert.sameMembers(result, selectors);

      // test for Ownershipfacet
      selectors = getSelectorsFromContract(OwnershipFacet).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[2]
      );

      // test for stratX2Settings
      selectors = getSelectorsFromContract(stratx2Settings).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[3]
      );
      assert.sameMembers(result, selectors);

      // test for stratX2
      selectors = getSelectorsFromContract(stratx2).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[4]
      );
      assert.sameMembers(result, selectors);

      // test for stratX2Getter
      selectors = getSelectorsFromContract(stratx2getter).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[5]
      );
      assert.sameMembers(result, selectors);
    });
  });
  describe('StratXFacet', () => {
    it('should return correct pid', async () => {
      let pid = await stratx2getter.pid();

      expect(pid).to.equal(0);
    });
    it('should return correct slippage factor', async () => {
      let slippageFactor = await stratx2getter.slippageFactor();

      expect(slippageFactor).to.equal(950);
    });
    it('should deposit want tokens in diamond StratX', async () => {
      console.log(await want.balanceOf(owner._address));

      await want
        .connect(owner)
        .approve(diamondAddress, ethers.utils.parseUnits('10', 'ether'));
      await expect(
        stratx2
          .connect(owner)
          .deposit(owner._address, ethers.utils.parseEther('10'))
      ).to.changeTokenBalances(
        want,
        [owner._address, stratB.address],
        [ethers.utils.parseEther('-10'), ethers.utils.parseEther('10')]
      );
    });
    it('should deposit want tokens in farmA -> Diamond Strat -> FarmB ->StratB', async () => {
      await want
        .connect(owner)
        .approve(farmA.address, ethers.utils.parseUnits('10', 'ether'));
      await expect(
        farmA.connect(owner).deposit(0, ethers.utils.parseEther('10'))
      ).to.changeTokenBalances(
        want,
        [owner._address, stratB.address],
        [ethers.utils.parseEther('-10'), ethers.utils.parseEther('10')]
      );
    });
    it('Should withdraw want tokens and that tokens will be transferred to user', async () => {
      await expect(
        farmA.connect(owner).withdraw(0, ethers.utils.parseUnits('1', 'ether'))
      ).to.changeTokenBalances(
        want,
        [owner._address, stratB.address],
        [ethers.utils.parseEther('1'), ethers.utils.parseEther('-1')]
      );
    });
    it('Should withdraw want tokens and that tokens will be transferred to farmA', async () => {
      await expect(
        stratx2
          .connect(owner)
          .withdraw(owner._address, ethers.utils.parseUnits('1', 'ether'))
      ).to.changeTokenBalances(
        want,
        [farmA.address, stratB.address],
        [ethers.utils.parseEther('1'), ethers.utils.parseEther('-1')]
      );
    });
    it('Should Withdraw want token and after withdrawing ,user will get some autoV21 tokens', async () => {
      let currentBlockTime = await time.latest();
      let one_day = currentBlockTime + 24 * 60 * 60;
      await time.increaseTo(one_day);
      let earn_balance_before = await autoV21.balanceOf(owner._address);

      await farmA
        .connect(owner)
        .withdraw(0, ethers.utils.parseUnits('1', 'ether'));
      let earn_balance_after = await autoV21.balanceOf(owner._address);

      expect(earn_balance_after - earn_balance_before).to.be.greaterThan(0);
    });
    it('Run earn and autocompound want tokens', async () => {
      /*
    Increasing blocktime to one year
     */
      const currentBlockTime = await time.latest();
      const one_year = currentBlockTime + 365 * 24 * 60 * 60;
      await time.increaseTo(one_year);

      let want_before = await want.balanceOf(stratB.address);
      await stratx2.connect(owner).earn();
      let want_after = await want.balanceOf(stratB.address);
      expect(want_after - want_before).to.be.greaterThan(0);
    });
  });
  describe('StratX2Settings', () => {
    it('Should set Settings', async () => {
      await stratx2Settings
        .connect(owner)
        .setSettings(10000, 9975, 250, 500, 500);
      expect(await stratx2getter.entranceFeeFactor()).to.equal(10000);
      expect(await stratx2getter.withdrawFeeFactor()).to.equal(9975);
      expect(await stratx2getter.controllerFee()).to.equal(250);
      expect(await stratx2getter.buyBackRate()).to.equal(500);
      expect(await stratx2getter.slippageFactor()).to.equal(500);
    });
  });
});
