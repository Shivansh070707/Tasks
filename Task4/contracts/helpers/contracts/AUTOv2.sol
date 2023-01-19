// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AUTOv2 is ERC20("AUTOv2", "AUTO"), Ownable {
    constructor() {
        _mint(msg.sender, 100 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
