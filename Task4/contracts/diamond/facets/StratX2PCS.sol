// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../libraries/StratX2.sol";
import "../helpers/Ownable.sol";

contract StratX2_PCS is Ownable {
    StratX2Storage internal s;

    constructor(
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
    ) public {
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

        transferOwnership(s.autoFarmAddress);
    }
}
