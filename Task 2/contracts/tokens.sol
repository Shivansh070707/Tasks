// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Gold is ERC20 {
    constructor() ERC20("GOLD", "GLD") {
        _mint(msg.sender, 10000000000000);
    }
}

contract Silver is ERC20 {
    constructor() ERC20("SILVER", "SIL") {
        _mint(msg.sender, 10000000000000);
    }
}
