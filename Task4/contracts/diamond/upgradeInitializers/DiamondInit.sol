// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import {IDiamondLoupe} from "../interfaces/IDiamondLoupe.sol";
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";
import {IERC173} from "../interfaces/IERC173.sol";
import {IERC165} from "../interfaces/IERC165.sol";

// It is expected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init funciton if you need to.

contract DiamondInit {
    // You can add parameters to this function in order to pass in
    // data to set your own state variables

    function init(
        address[] memory _addresses,
        uint256 _pid,
        bool _isCAKEStaking,
        bool _isSameAssetDeposit,
        bool _isAutoComp,
        address[] memory _earnedToAUTOPath,
        address[] memory _earnedToToken0Path,
        address[] memory _earnedToToken1Path,
        address[] memory _token0ToEarnedPath,
        address[] memory _token1ToEarnedPath,
        uint256[] memory _num
    ) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;

        s.wbnbAddress = _addresses[0];
        s.govAddress = _addresses[1];
        s.autoFarmAddress = _addresses[2];
        s.AUTOAddress = _addresses[3];

        s.wantAddress = _addresses[4];
        s.token0Address = _addresses[5];
        s.token1Address = _addresses[6];
        s.earnedAddress = _addresses[7];

        s.farmContractAddress = _addresses[8];
        s.pid = _pid;
        s.isCAKEStaking = _isCAKEStaking;
        s.isSameAssetDeposit = _isSameAssetDeposit;

        s.isAutoComp = _isAutoComp;

        s.uniRouterAddress = _addresses[9];
        s.earnedToAUTOPath = _earnedToAUTOPath;

        s.earnedToToken0Path = _earnedToToken0Path;
        s.earnedToToken1Path = _earnedToToken1Path;
        s.token0ToEarnedPath = _token0ToEarnedPath;
        s.token1ToEarnedPath = _token1ToEarnedPath;

        s.controllerFee = _num[0];
        s.rewardsAddress = _addresses[10];
        s.buyBackRate = _num[1];

        s.buyBackAddress = _addresses[11];
        s.entranceFeeFactor = _num[2];
        s.withdrawFeeFactor = _num[3];

        // add your own state variables
        // EIP-2535 specifies that the `diamondCut` function takes two optional
        // arguments: address _init and bytes calldata _calldata
        // These arguments are used to execute an arbitrary function using delegatecall
        // in order to set state variables in the diamond during deployment or an upgrade
        // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface
    }
}
