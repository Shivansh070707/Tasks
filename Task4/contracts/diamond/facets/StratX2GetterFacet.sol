// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../libraries/LibDiamond.sol";

contract StratX2GetterFacet {
    function isCAKEStaking() external view returns (bool) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.isCAKEStaking;
    }

    function isSameAssetDeposit() external view returns (bool) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.isSameAssetDeposit;
    }

    function isAutoComp() external view returns (bool) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.isAutoComp;
    }

    function farmContractAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.farmContractAddress;
    }

    function token0Address() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.token0Address;
    }

    function pid() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.pid;
    }

    function wantAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.wantAddress;
    }

    function token1Address() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.token1Address;
    }

    function earnedAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.earnedAddress;
    }

    function uniRouterAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.uniRouterAddress;
    }

    function wbnbAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.wbnbAddress;
    }

    function autoFarmAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.autoFarmAddress;
    }

    function AUTOAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.AUTOAddress;
    }

    function govAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.govAddress;
    }

    function onlyGov() external view returns (bool) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.onlyGov;
    }

    function lastEarnBlock() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.lastEarnBlock;
    }

    function wantLockedTotal() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.wantLockedTotal;
    }

    function sharesTotal() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.sharesTotal;
    }

    function controllerFee() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.controllerFee;
    }

    function controllerFeeMax() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.controllerFeeMax;
    }

    function buyBackRate() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.buyBackRate;
    }

    function buyBackRateMax() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.buyBackRateMax;
    }

    function buyBackRateUL() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.buyBackRateUL;
    }

    function buyBackAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.buyBackAddress;
    }

    function rewardsAddress() external view returns (address) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.rewardsAddress;
    }

    function entranceFeeFactor() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.entranceFeeFactor;
    }

    function entranceFeeFactorMax() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.entranceFeeFactorMax;
    }

    function entranceFeeFactorLL() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.entranceFeeFactorLL;
    }

    function withdrawFeeFactor() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.withdrawFeeFactor;
    }

    function withdrawFeeFactorMax() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.withdrawFeeFactorMax;
    }

    function withdrawFeeFactorLL() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.withdrawFeeFactorLL;
    }

    function slippageFactor() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.slippageFactor;
    }

    function slippageFactorUL() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.slippageFactorUL;
    }

    function earnedToAUTOPath() external view returns (address[] memory) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.earnedToAUTOPath;
    }

    function earnedToToken0Path() external view returns (address[] memory) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.earnedToToken0Path;
    }

    function earnedToToken1Path() external view returns (address[] memory) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.earnedToToken1Path;
    }

    function token0ToEarnedPath() external view returns (address[] memory) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.token0ToEarnedPath;
    }

    function token1ToEarnedPath() external view returns (address[] memory) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.token1ToEarnedPath;
    }
}
