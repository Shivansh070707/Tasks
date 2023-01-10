// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import {LibDiamond} from "./libraries/LibDiamond.sol";
import {IDiamondCut} from "./interfaces/IDiamondCut.sol";
import "./libraries/StratX2.sol";

contract Diamond {
    StratX2Storage internal s;
    address internal mainContractOwner;
    bool internal mainContractPaused;

    constructor(
        address _contractOwner,
        address _diamondCutFacet,
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
        uint256 _controllerFee,
        uint256 _buyBackRate,
        uint256 _entranceFeeFactor,
        uint256 _withdrawFeeFactor
    ) public payable {
        LibDiamond.setContractOwner(_contractOwner);

        // Add the diamondCut external function from the diamondCutFacet
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCut.diamondCut.selector;
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _diamondCutFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: functionSelectors
        });
        LibDiamond.diamondCut(cut, address(0), "");
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

        s.controllerFee = _controllerFee;
        s.rewardsAddress = _addresses[10];
        s.buyBackRate = _buyBackRate;
        s.buyBackAddress = _addresses[11];
        s.entranceFeeFactor = _entranceFeeFactor;
        s.withdrawFeeFactor = _withdrawFeeFactor;

        LibDiamond.transferOwnership(s.autoFarmAddress);
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        // get diamond storage
        assembly {
            ds.slot := position
        }
        // get facet from function selector
        address facet = ds
            .facetAddressAndSelectorPosition[msg.sig]
            .facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");
        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {}

    function setMainContractOwner(address _mainContractOwner) external {
        mainContractOwner = _mainContractOwner;
    }
}
