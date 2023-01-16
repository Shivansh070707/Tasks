// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../libraries/LibDiamond.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IPancakeswapFarm.sol";
import "../interfaces/IPancakeRouter02.sol";
import "../interfaces/IWBNB.sol";
import "../interfaces/IModifier.sol";

contract StratX2Facet is IModifier {
    using SafeERC20 for IERC20;

    function deposit(uint256 _wantAmt) public nonreentrant returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();

        require(!LibDiamond.paused(), "Pausable: paused");
        IERC20(s.wantAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _wantAmt
        );

        uint256 sharesAdded = _wantAmt;
        if (s.wantLockedTotal > 0 && s.sharesTotal > 0) {
            sharesAdded =
                (_wantAmt * s.sharesTotal * s.entranceFeeFactor) /
                (s.wantLockedTotal) /
                (s.entranceFeeFactorMax);
        }
        s.sharesTotal = s.sharesTotal + (sharesAdded);

        if (s.isAutoComp) {
            _farm();
        } else {
            s.wantLockedTotal = s.wantLockedTotal + (_wantAmt);
        }
        s.lock = 0;

        return sharesAdded;
    }

    function _farm() internal {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(s.isAutoComp, "!isAutoComp");
        uint256 wantAmt = IERC20(s.wantAddress).balanceOf(address(this));
        s.wantLockedTotal = s.wantLockedTotal + (wantAmt);
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

    function _unfarm(uint256 _wantAmt) internal {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        if (s.isCAKEStaking) {
            IPancakeswapFarm(s.farmContractAddress).leaveStaking(_wantAmt); // Just for CAKE staking, we dont use withdraw()
        } else {
            IPancakeswapFarm(s.farmContractAddress).withdraw(s.pid, _wantAmt);
        }
    }

    function withdraw(uint256 _wantAmt) public nonreentrant returns (uint256) {
        require(_wantAmt > 0, "_wantAmt <= 0");
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();

        uint256 sharesRemoved = (_wantAmt * (s.sharesTotal)) /
            (s.wantLockedTotal);
        if (sharesRemoved > s.sharesTotal) {
            sharesRemoved = s.sharesTotal;
        }
        s.sharesTotal = s.sharesTotal - (sharesRemoved);

        if (s.withdrawFeeFactor < s.withdrawFeeFactorMax) {
            _wantAmt =
                (_wantAmt * s.withdrawFeeFactor) /
                (s.withdrawFeeFactorMax);
        }

        if (s.isAutoComp) {
            _unfarm(_wantAmt);
        }

        uint256 wantAmt = IERC20(s.wantAddress).balanceOf(address(this));
        if (_wantAmt > wantAmt) {
            _wantAmt = wantAmt;
        }

        if (s.wantLockedTotal < _wantAmt) {
            _wantAmt = s.wantLockedTotal;
        }

        s.wantLockedTotal = s.wantLockedTotal - (_wantAmt);

        IERC20(s.wantAddress).safeTransfer(s.autoFarmAddress, _wantAmt);

        return sharesRemoved;
    }

    // 1. Harvest farm tokens
    // 2. Converts farm tokens into want tokens
    // 3. Deposits want tokens

    function earn() public nonreentrant {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();

        require(!LibDiamond.paused(), "Pausable: paused");
        require(s.isAutoComp, "!isAutoComp");
        if (s.onlyGov) {
            require(msg.sender == s.govAddress, "!gov");
        }

        // Harvest farm tokens
        _unfarm(0);

        if (s.earnedAddress == s.wbnbAddress) {
            _wrapBNB();
        }

        // Converts farm tokens into want tokens
        uint256 earnedAmt = IERC20(s.earnedAddress).balanceOf(address(this));

        earnedAmt = distributeFees(earnedAmt);
        earnedAmt = buyBack(earnedAmt);

        if (s.isCAKEStaking || s.isSameAssetDeposit) {
            s.lastEarnBlock = block.number;
            _farm();
            return;
        }

        IERC20(s.earnedAddress).safeApprove(s.uniRouterAddress, 0);
        IERC20(s.earnedAddress).safeIncreaseAllowance(
            s.uniRouterAddress,
            earnedAmt
        );

        if (s.earnedAddress != s.token0Address) {
            // Swap half earned to token0
            _safeSwap(
                s.uniRouterAddress,
                earnedAmt / (2),
                s.slippageFactor,
                s.earnedToToken0Path,
                address(this),
                block.timestamp + (600)
            );
        }

        if (s.earnedAddress != s.token1Address) {
            // Swap half earned to token1
            _safeSwap(
                s.uniRouterAddress,
                earnedAmt / 2,
                s.slippageFactor,
                s.earnedToToken1Path,
                address(this),
                block.timestamp + (600)
            );
        }

        // Get want tokens, ie. add liquidity
        uint256 token0Amt = IERC20(s.token0Address).balanceOf(address(this));
        uint256 token1Amt = IERC20(s.token1Address).balanceOf(address(this));
        if (token0Amt > 0 && token1Amt > 0) {
            IERC20(s.token0Address).safeIncreaseAllowance(
                s.uniRouterAddress,
                token0Amt
            );
            IERC20(s.token1Address).safeIncreaseAllowance(
                s.uniRouterAddress,
                token1Amt
            );
            IPancakeRouter02(s.uniRouterAddress).addLiquidity(
                s.token0Address,
                s.token1Address,
                token0Amt,
                token1Amt,
                0,
                0,
                address(this),
                block.timestamp + (600)
            );
        }

        s.lastEarnBlock = block.number;

        _farm();
    }

    function buyBack(uint256 _earnedAmt) internal returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        if (s.buyBackRate <= 0) {
            return _earnedAmt;
        }

        uint256 buyBackAmt = (_earnedAmt * (s.buyBackRate)) /
            (s.buyBackRateMax);

        if (s.earnedAddress == s.AUTOAddress) {
            IERC20(s.earnedAddress).safeTransfer(s.buyBackAddress, buyBackAmt);
        } else {
            IERC20(s.earnedAddress).safeIncreaseAllowance(
                s.uniRouterAddress,
                buyBackAmt
            );

            _safeSwap(
                s.uniRouterAddress,
                buyBackAmt,
                s.slippageFactor,
                s.earnedToAUTOPath,
                s.buyBackAddress,
                block.timestamp + (600)
            );
        }

        return _earnedAmt - (buyBackAmt);
    }

    function distributeFees(uint256 _earnedAmt) internal returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        if (_earnedAmt > 0) {
            // Performance fee
            if (s.controllerFee > 0) {
                uint256 fee = (_earnedAmt * (s.controllerFee)) /
                    (s.controllerFeeMax);
                IERC20(s.earnedAddress).safeTransfer(s.rewardsAddress, fee);
                _earnedAmt = _earnedAmt - (fee);
            }
        }

        return _earnedAmt;
    }

    function convertDustToEarned() public {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(!LibDiamond.paused(), "Pausable: paused");
        require(s.isAutoComp, "!isAutoComp");
        require(!s.isCAKEStaking, "isCAKEStaking");

        // Converts dust tokens into earned tokens, which will be reinvested on the next earn().

        // Converts token0 dust (if any) to earned tokens
        uint256 token0Amt = IERC20(s.token0Address).balanceOf(address(this));
        if (s.token0Address != s.earnedAddress && token0Amt > 0) {
            IERC20(s.token0Address).safeIncreaseAllowance(
                s.uniRouterAddress,
                token0Amt
            );

            // Swap all dust tokens to earned tokens
            _safeSwap(
                s.uniRouterAddress,
                token0Amt,
                s.slippageFactor,
                s.token0ToEarnedPath,
                address(this),
                block.timestamp + (600)
            );
        }

        // Converts token1 dust (if any) to earned tokens
        uint256 token1Amt = IERC20(s.token1Address).balanceOf(address(this));
        if (s.token1Address != s.earnedAddress && token1Amt > 0) {
            IERC20(s.token1Address).safeIncreaseAllowance(
                s.uniRouterAddress,
                token1Amt
            );

            // Swap all dust tokens to earned tokens
            _safeSwap(
                s.uniRouterAddress,
                token1Amt,
                s.slippageFactor,
                s.token1ToEarnedPath,
                address(this),
                block.timestamp + (600)
            );
        }
    }

    function inCaseTokensGetStuck(
        address _token,
        uint256 _amount,
        address _to
    ) public {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        require(_token != s.earnedAddress, "!safe,token is Earned address");
        require(_token != s.wantAddress, "!safe,token is want address");
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function _wrapBNB() internal {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        // BNB -> WBNB
        uint256 bnbBal = address(this).balance;
        if (bnbBal > 0) {
            IWBNB(s.wbnbAddress).deposit{value: bnbBal}(); // BNB -> WBNB
        }
    }

    function wrapBNB() public {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        require(msg.sender == s.govAddress, "!gov");
        _wrapBNB();
    }

    function _safeSwap(
        address _uniRouterAddress,
        uint256 _amountIn,
        uint256 _slippageFactor,
        address[] memory _path,
        address _to,
        uint256 _deadline
    ) internal {
        uint256[] memory amounts = IPancakeRouter02(_uniRouterAddress)
            .getAmountsOut(_amountIn, _path);
        uint256 amountOut = amounts[amounts.length - (1)];

        IPancakeRouter02(_uniRouterAddress)
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                _amountIn,
                (amountOut * (_slippageFactor)) / (1000),
                _path,
                _to,
                _deadline
            );
    }

    function checkreentrancy() external nonreentrant {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        s.num++;
        (bool success, ) = address(msg.sender).call(" ");
        require(success, "internal check failed");
    }

    function getnum() external view returns (uint256) {
        LibDiamond.StratX2Storage storage s = LibDiamond.stratX2Storage();
        return s.num;
    }
}
