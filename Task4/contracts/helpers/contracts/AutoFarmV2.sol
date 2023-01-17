// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "./AUTOToken.sol";
abstract contract AUTOToken is ERC20 {
    function mint(address _to, uint256 _amount) external virtual;
}

// For interacting with our own strategy
interface IStrategy {
    // Main want token compounding function
    function earn() external;

    function inCaseTokensGetStuck(
        address _token,
        uint256 _amount,
        address _to
    ) external;

    // Transfer want tokens autoFarm -> strategy
    function deposit(uint256 _wantAmt) external returns (uint256);

    // Transfer want tokens strategy -> autoFarm
    function withdraw(uint256 _wantAmt) external returns (uint256);

    // Total want tokens managed by stratfegy
    function wantLockedTotal() external view returns (uint256);

    // Sum of all shares of users to wantLockedTotal
    function sharesTotal() external view returns (uint256);
}

contract AutoFarmV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    //  using SafeMath for uint256;

    // Info of each user.
    struct UserInfo {
        uint256 shares; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.

        // We do some fancy math here. Basically, any point in time, the amount of auto
        // entitled to a user but is pending to be distributed is:
        //
        //   amount = user.shares / sharesTotal * wantLockedTotal
        //   pending reward = (amount * pool.accAUTOPerShare) - user.rewardDebt
        //
        // Whenever a user deposits or withdraws want tokens to a pool. Here's what happens:
        //   1. The pool's `accAUTOPerShare` (and `lastRewardBlock`) gets updated.
        //   2. User receives the pending reward sent to his/her address.
        //   3. User's `amount` gets updated.
        //   4. User's `rewardDebt` gets updated.
    }

    struct PoolInfo {
        IERC20 want; // Address of the want token.
        uint256 allocPoint; // How many allocation points assigned to this pool. auto to distribute per block.
        uint256 lastRewardBlock; // Last block number that auto distribution occurs.
        uint256 accAUTOPerShare; // Accumulated auto per share, times 1e12. See below.
        address strat; // Strategy address that will auto compound want tokens
    }

    address public immutable autoV2;

    address public burnAddress = 0x000000000000000000000000000000000000dEaD;

    uint256 public ownerAUTOReward = 138; // 12%

    uint256 public autoMaxSupply = 80000e18;
    uint256 public autoPerBlock = 8000000000000000; // auto tokens created per block
    uint256 public startBlock = 3888888; //https://bscscan.com/block/countdown/3888888

    PoolInfo[] public poolInfo; // Info of each pool.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
    uint256 public totalAllocPoint = 0; // Total allocation points. Must be the sum of all allocation points in all pools.

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(address _autoV2) {
        autoV2 = _autoV2;
    }

    // Want tokens moved from user -> AUTOFarm (auto allocation) -> Strat (compounding)
    function deposit(uint256 _pid, uint256 _wantAmt) external nonReentrant {
        updatePool(_pid);
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        if (user.shares > 0) {
            uint256 pending = (user.shares * (pool.accAUTOPerShare)) /
                (1e12) -
                (user.rewardDebt);
            if (pending > 0) {
                _safeAUTOTransfer(msg.sender, pending);
            }
        }
        if (_wantAmt > 0) {
            pool.want.safeTransferFrom(
                address(msg.sender),
                address(this),
                _wantAmt
            );

            pool.want.safeIncreaseAllowance(pool.strat, _wantAmt);
            uint256 sharesAdded = IStrategy(poolInfo[_pid].strat).deposit(
                _wantAmt
            );
            user.shares = user.shares + (sharesAdded);
        }
        user.rewardDebt = (user.shares * (pool.accAUTOPerShare)) / (1e12);
        emit Deposit(msg.sender, _pid, _wantAmt);
    }

    function withdrawAll(uint256 _pid) external nonReentrant {
        withdraw(_pid, type(uint256).max);
    }

    function inCaseTokensGetStuck(address _token, uint256 _amount)
        external
        onlyOwner
    {
        require(_token != autoV2, "!safe");
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat)
            .wantLockedTotal();
        uint256 sharesTotal = IStrategy(poolInfo[_pid].strat).sharesTotal();
        uint256 amount = (user.shares * (wantLockedTotal)) / (sharesTotal);

        IStrategy(poolInfo[_pid].strat).withdraw(amount);

        pool.want.safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
        user.shares = 0;
        user.rewardDebt = 0;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do. (Only if want tokens are stored here.)

    function add(
        uint256 _allocPoint,
        IERC20 _want,
        bool _withUpdate,
        address _strat
    ) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint + (_allocPoint);
        poolInfo.push(
            PoolInfo({
                want: _want,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accAUTOPerShare: 0,
                strat: _strat
            })
        );
    }

    // Update the given pool's auto allocation point. Can only be called by the owner.
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) external onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint =
            totalAllocPoint -
            (poolInfo[_pid].allocPoint) +
            (_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // View function to see pending auto on frontend.
    function pendingAUTO(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accAUTOPerShare = pool.accAUTOPerShare;
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
        if (block.number > pool.lastRewardBlock && sharesTotal != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 autoReward = (multiplier *
                (autoPerBlock) *
                (pool.allocPoint)) / (totalAllocPoint);
            accAUTOPerShare =
                accAUTOPerShare +
                ((autoReward * (1e12)) / (sharesTotal));
        }
        return (user.shares * (accAUTOPerShare)) / (1e12) - (user.rewardDebt);
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // View function to see staked Want tokens on frontend.
    function stakedWantTokens(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];

        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
        uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat)
            .wantLockedTotal();
        if (sharesTotal == 0) {
            return 0;
        }
        return (user.shares * (wantLockedTotal)) / (sharesTotal);
    }

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _wantAmt) public nonReentrant {
        updatePool(_pid);

        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat)
            .wantLockedTotal();
        uint256 sharesTotal = IStrategy(poolInfo[_pid].strat).sharesTotal();

        require(user.shares > 0, "user.shares is 0");
        require(sharesTotal > 0, "sharesTotal is 0");

        // Withdraw pending auto
        uint256 pending = (user.shares * (pool.accAUTOPerShare)) /
            (1e12) -
            (user.rewardDebt);
        if (pending > 0) {
            _safeAUTOTransfer(msg.sender, pending);
        }

        // Withdraw want tokens
        uint256 amount = (user.shares * (wantLockedTotal)) / (sharesTotal);
        if (_wantAmt > amount) {
            _wantAmt = amount;
        }
        if (_wantAmt > 0) {
            uint256 sharesRemoved = IStrategy(poolInfo[_pid].strat).withdraw(
                _wantAmt
            );

            if (sharesRemoved > user.shares) {
                user.shares = 0;
            } else {
                user.shares = user.shares - (sharesRemoved);
            }

            uint256 wantBal = IERC20(pool.want).balanceOf(address(this));
            if (wantBal < _wantAmt) {
                _wantAmt = wantBal;
            }
            pool.want.safeTransfer(address(msg.sender), _wantAmt);
        }
        user.rewardDebt = (user.shares * (pool.accAUTOPerShare)) / (1e12);
        emit Withdraw(msg.sender, _pid, _wantAmt);
    }

    // Update reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();

        if (sharesTotal == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);

        if (multiplier <= 0) {
            return;
        }
        uint256 autoReward = (multiplier * (autoPerBlock) * (pool.allocPoint)) /
            (totalAllocPoint);

        AUTOToken(autoV2).mint(
            owner(),
            (autoReward * (ownerAUTOReward)) / (1000)
        );
        AUTOToken(autoV2).mint(address(this), autoReward);

        pool.accAUTOPerShare =
            pool.accAUTOPerShare +
            ((autoReward * (1e12)) / (sharesTotal));
        pool.lastRewardBlock = block.number;
    }

    // Return reward multiplier over the given _from to _to block.
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        if (IERC20(autoV2).totalSupply() >= autoMaxSupply) {
            return 0;
        }
        return _to - (_from);
    }

    // Safe auto transfer function, just in case if rounding error causes pool to not have enough
    function _safeAUTOTransfer(address _to, uint256 _AUTOAmt) internal {
        uint256 AUTOBal = IERC20(autoV2).balanceOf(address(this));
        if (_AUTOAmt > AUTOBal) {
            IERC20(autoV2).transfer(_to, AUTOBal);
        } else {
            IERC20(autoV2).transfer(_to, _AUTOAmt);
        }
    }
}
