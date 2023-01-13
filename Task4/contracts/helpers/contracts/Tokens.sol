// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Matic is ERC20("Matic", "MATIC"), Ownable {
    constructor() {
        _mint(msg.sender, 100000000 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}

contract Bitcoin is ERC20("Bitcoin", "BTC"), Ownable {
    constructor() {
        _mint(msg.sender, 100000000 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}

contract XRP is ERC20("Ripple", "XRP"), Ownable {
    constructor() {
        _mint(msg.sender, 100 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}

contract Cardano is ERC20("Cardano", "ADA"), Ownable {
    constructor() {
        _mint(msg.sender, 100000000 ether);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
