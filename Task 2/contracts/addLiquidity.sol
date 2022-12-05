// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IUniswapV2Router {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
}

interface IUniswapV2Factory {
    function getPair(
        address token0,
        address token1
    ) external view returns (address);
}

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint);

    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);
}

contract UniswapV2SwapExamples {
    address private constant _UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant _FACTORY =
        0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address private immutable _sil;
    address private immutable _gld;
    IUniswapV2Router private _router = IUniswapV2Router(_UNISWAP_V2_ROUTER);
    event AddLiquidity(uint amountA, uint amountB, uint liquidity);

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
            address(this),
            block.timestamp
        );
        emit AddLiquidity(amountA, amountB, liquidity);
    }

    function removeLiquidity(
        address _tokenA,
        address _tokenB
    ) external returns (uint amountA, uint amountB) {
        address pair = IUniswapV2Factory(_FACTORY).getPair(_tokenA, _tokenB);
        uint liquidity = IERC20(pair).balanceOf(address(this));
        IERC20(pair).approve(_UNISWAP_V2_ROUTER, liquidity);
        (amountA, amountB) = _router.removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp
        );
    }
}
