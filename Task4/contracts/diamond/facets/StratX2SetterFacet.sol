// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../libraries/LibDiamond.sol";

contract StratX2SetterFacet {
    event SetSettings(
        uint256 _entranceFeeFactor,
        uint256 _withdrawFeeFactor,
        uint256 _controllerFee,
        uint256 _buyBackRate,
        uint256 _slippageFactor
    );

    event SetGov(address _govAddress);
    event SetOnlyGov(bool _onlyGov);
    event SetUniRouterAddress(address _uniRouterAddress);
    event SetBuyBackAddress(address _buyBackAddress);
    event SetRewardsAddress(address _rewardsAddress);

    function setSettings(
        uint256 _entranceFeeFactor,
        uint256 _withdrawFeeFactor,
        uint256 _controllerFee,
        uint256 _buyBackRate,
        uint256 _slippageFactor
    ) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        require(
            _entranceFeeFactor >= s.entranceFeeFactorLL,
            "_entranceFeeFactor too low"
        );
        require(
            _entranceFeeFactor <= s.entranceFeeFactorMax,
            "_entranceFeeFactor too high"
        );
        s.entranceFeeFactor = _entranceFeeFactor;

        require(
            _withdrawFeeFactor >= s.withdrawFeeFactorLL,
            "_withdrawFeeFactor too low"
        );
        require(
            _withdrawFeeFactor <= s.withdrawFeeFactorMax,
            "_withdrawFeeFactor too high"
        );
        s.withdrawFeeFactor = _withdrawFeeFactor;

        require(_controllerFee <= s.controllerFeeUL, "_controllerFee too high");
        s.controllerFee = _controllerFee;

        require(_buyBackRate <= s.buyBackRateUL, "_buyBackRate too high");
        s.buyBackRate = _buyBackRate;

        require(
            _slippageFactor <= s.slippageFactorUL,
            "_slippageFactor too high"
        );
        s.slippageFactor = _slippageFactor;

        emit SetSettings(
            _entranceFeeFactor,
            _withdrawFeeFactor,
            _controllerFee,
            _buyBackRate,
            _slippageFactor
        );
    }

    function setGov(address _govAddress) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        s.govAddress = _govAddress;
        emit SetGov(_govAddress);
    }

    function setOnlyGov(bool _onlyGov) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        s.onlyGov = _onlyGov;
        emit SetOnlyGov(_onlyGov);
    }

    function setUniRouterAddress(address _uniRouterAddress) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        s.uniRouterAddress = _uniRouterAddress;
        emit SetUniRouterAddress(_uniRouterAddress);
    }

    function setBuyBackAddress(address _buyBackAddress) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        s.buyBackAddress = _buyBackAddress;
        emit SetBuyBackAddress(_buyBackAddress);
    }

    function setRewardsAddress(address _rewardsAddress) external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        s.rewardsAddress = _rewardsAddress;
        emit SetRewardsAddress(_rewardsAddress);
    }

    function pause() external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        LibDiamond._pause();
    }

    function unpause() external {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        LibDiamond._unpause();
    }
}
