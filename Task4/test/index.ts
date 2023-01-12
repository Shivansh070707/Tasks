import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { deployDiamond } from "../scripts/deploy";
import { FacetCutAction, getSelectorsFromContract } from "../scripts/libraries";
import { DiamondCutFacet, DiamondLoupeFacet } from "../typechain-types";

describe("Test", () => {
  let diamondAddress: string;
  let diamondCutFacet: Contract | DiamondCutFacet;
  let diamondLoupeFacet: Contract | DiamondLoupeFacet;
  let stratx2: Contract;
  // let stratx2Settings: Contract;

  let facetAddresses: string[]; // DiamondCutFacet, DiamondLoupeFacet, TokenAvgPriceV1
  let owner: string;
  let accounts: SignerWithAddress[];

  before(async () => {
    // deploy contracts
    diamondAddress = await deployDiamond();
    diamondCutFacet = await ethers.getContractAt(
      "DiamondCutFacet",
      diamondAddress
    );
    diamondLoupeFacet = await ethers.getContractAt(
      "DiamondLoupeFacet",
      diamondAddress
    );
    console.log("1");

    stratx2 = await ethers.getContractAt("StratX2Facet", diamondAddress);
    accounts = await ethers.getSigners();
    console.log("2");
    owner = accounts[0].address;
  });

  describe("test - diamond", () => {
    it("should have 3 facets -- call to facetAddresses", async () => {
      facetAddresses = await diamondLoupeFacet.facetAddresses();
      console.log(facetAddresses);

      assert(facetAddresses.length === 4);
    });

    it("should have the right function selectors -- call to faceFunctionSelectors", async () => {
      let selectors, result;
      // test for DiamondCutFacet
      selectors = getSelectorsFromContract(diamondCutFacet).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[0]
      );
      assert.sameMembers(result, selectors);
      // console.log("--- selectors ---");
      // console.log(selectors);

      // test for DiamondLoupeFacet
      selectors = getSelectorsFromContract(diamondLoupeFacet).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[1]
      );
      assert.sameMembers(result, selectors);
      // console.log("--- selectors ---");
      // console.log(selectors)

      // test for stratX2
      selectors = getSelectorsFromContract(stratx2).getSelectors();
      result = await diamondLoupeFacet.facetFunctionSelectors(
        facetAddresses[3]
      );
      assert.sameMembers(result, selectors);
      // console.log("--- selectors ---");
      // console.log(selectors);
    });
  });
  describe("stratX", () => {
    it("should return pid", async () => {
      let pid = await stratx2.pid();
      console.log("pid", pid);

      expect(pid).to.equal(500);
    });
  });
});
