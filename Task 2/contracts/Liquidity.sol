// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IUniswapV2Router.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Liquidity is IUniswapV2Pair {
    address private constant _UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant _FACTORY =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;

    address private immutable _sil;
    address private immutable _gld;

    IUniswapV2Router private _router = IUniswapV2Router(_UNISWAP_V2_ROUTER);

    event AddLiquidity(uint amountA, uint amountB, uint liquidity);
    event RemoveLiquidity(uint amountA, uint amountB, uint liquidityBurned);

    constructor(address sil, address gld) {
        _sil = sil;
        _gld = gld;
    }

    function addLiquidity(
        uint _amountA,
        uint _amountB
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        IERC20(_sil).transferFrom(msg.sender, address(this), _amountA);
        IERC20(_gld).transferFrom(msg.sender, address(this), _amountB);
        IERC20(_sil).approve(_UNISWAP_V2_ROUTER, _amountA);
        IERC20(_gld).approve(_UNISWAP_V2_ROUTER, _amountB);

        (amountA, amountB, liquidity) = _router.addLiquidity(
            _sil,
            _gld,
            _amountA,
            _amountB,
            1,
            1,
            msg.sender,
            block.timestamp
        );

        emit AddLiquidity(amountA, amountB, liquidity);
    }

    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint liquidity
    ) external returns (uint amountA, uint amountB) {
        address pair = IUniswapV2Factory(_FACTORY).getPair(_tokenA, _tokenB);
        uint balance = IERC20(pair).balanceOf(msg.sender);
        require(balance > liquidity, "Insufficient Liquidity");
        IERC20(pair).transferFrom(msg.sender, address(this), liquidity);
        IERC20(pair).approve(_UNISWAP_V2_ROUTER, liquidity);
        (amountA, amountB) = _router.removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            msg.sender,
            block.timestamp
        );

        emit RemoveLiquidity(amountA, amountB, liquidity);
    }

    function getPair(
        address _tokenA,
        address _tokenB
    ) public view returns (address pair) {
        pair = IUniswapV2Factory(_FACTORY).getPair(_tokenA, _tokenB);
    }

    function getLiquidityBalance(
        address _tokenA,
        address _tokenB
    ) public view returns (uint liquidity) {
        address pair = getPair(_tokenA, _tokenB);
        liquidity = IERC20(pair).balanceOf(msg.sender);
    }
}
