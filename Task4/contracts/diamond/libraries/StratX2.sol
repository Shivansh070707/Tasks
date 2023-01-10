// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
struct StratX2Storage {
    bool isCAKEStaking; // only for staking CAKE using pancakeswap's native CAKE staking contract.
    bool isSameAssetDeposit;
    bool isAutoComp; // this vault is purely for staking. eg. WBNB-AUTO staking vault.
    address farmContractAddress; // address of farm, eg, PCS, Thugs etc.
    uint256 pid; // pid of pool in farmContractAddress
    address wantAddress;
    address token0Address;
    address token1Address;
    address earnedAddress;
    address uniRouterAddress; // uniswap, pancakeswap etc
    address wbnbAddress;
    address autoFarmAddress;
    address AUTOAddress;
    address govAddress; // timelock contract
    bool onlyGov;
    uint256 lastEarnBlock;
    uint256 wantLockedTotal;
    uint256 sharesTotal;
    uint256 controllerFee; // 70;
    uint256 controllerFeeMax; // 100 = 1%
    uint256 controllerFeeUL;
    uint256 buyBackRate; // 250;
    uint256 buyBackRateMax; // 100 = 1%
    uint256 buyBackRateUL;
    address buyBackAddress;
    address rewardsAddress;
    uint256 entranceFeeFactor; // < 0.1% entrance fee - goes to pool + prevents front-running
    uint256 entranceFeeFactorMax;
    uint256 entranceFeeFactorLL; // 0.5% is the max entrance fee settable. LL = lowerlimit
    uint256 withdrawFeeFactor; // 0.1% withdraw fee - goes to pool
    uint256 withdrawFeeFactorMax;
    uint256 withdrawFeeFactorLL; // 0.5% is the max entrance fee settable. LL = lowerlimit
    uint256 slippageFactor; // 5% default slippage tolerance
    uint256 slippageFactorUL;
    address[] earnedToAUTOPath;
    address[] earnedToToken0Path;
    address[] earnedToToken1Path;
    address[] token0ToEarnedPath;
    address[] token1ToEarnedPath;
}
