// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./helpers/ERC20.sol";

import "./libraries/Address.sol";

import "./libraries/SafeERC20.sol";

import "./helpers/Ownable.sol";

contract AUTOv2 is ERC20("AUTOv2", "AUTO"), Ownable {
    constructor() public {
        _mint(msg.sender, 100000000 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
