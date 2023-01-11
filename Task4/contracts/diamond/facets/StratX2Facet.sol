// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../libraries/SafeERC20.sol";
import "../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../interfaces/IPancakeswapFarm.sol";

contract StratX2Facet is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    LibDiamond.StratX2Storage internal s = LibDiamond.stratX2Storage();

    function deposit(
        address _userAddress,
        uint256 _wantAmt
    ) public virtual onlyOwner nonReentrant whenNotPaused returns (uint256) {
        IERC20(s.wantAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _wantAmt
        );

        uint256 sharesAdded = _wantAmt;
        if (s.wantLockedTotal > 0 && s.sharesTotal > 0) {
            sharesAdded = _wantAmt
                .mul(s.sharesTotal)
                .mul(s.entranceFeeFactor)
                .div(s.wantLockedTotal)
                .div(s.entranceFeeFactorMax);
        }
        s.sharesTotal = s.sharesTotal.add(sharesAdded);

        if (s.isAutoComp) {
            _farm();
        } else {
            s.wantLockedTotal = s.wantLockedTotal.add(_wantAmt);
        }

        return sharesAdded;
    }

    function _farm() internal virtual {
        require(s.isAutoComp, "!isAutoComp");
        uint256 wantAmt = IERC20(s.wantAddress).balanceOf(address(this));
        s.wantLockedTotal = s.wantLockedTotal.add(wantAmt);
        IERC20(s.wantAddress).safeIncreaseAllowance(
            s.farmContractAddress,
            wantAmt
        );

        if (s.isCAKEStaking) {
            IPancakeswapFarm(s.farmContractAddress).enterStaking(wantAmt); // Just for CAKE staking, we dont use deposit()
        } else {
            IPancakeswapFarm(s.farmContractAddress).deposit(s.pid, wantAmt);
        }
    }

    function pid() external view returns (uint) {
        return s.pid;
    }
}
