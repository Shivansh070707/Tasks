// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenA is ERC20 {
    uint price;

    constructor() ERC20("TokenA", "TA") {
        price = 0.15 ether;
    }

    function mint(address to, uint amount) external payable returns (bool) {
        require(amount > 0, "Invalid amount");
        require(msg.value >= amount * price, "Not enough Balance");
        _mint(to, amount * 10 ** 18);
        return true;
    }

    function burn(uint amount) external {
        _burn(msg.sender, amount);
    }
}
