// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract ReentrancyChecker {
    address victim;
    uint256 num;

    constructor(address _victim) {
        victim = _victim;
    }

    function attack() public {
        uint256 x = 0;
        while (x < 4) {
            (bool success, ) = victim.call(
                abi.encodeWithSignature("checkreentrancy()")
            );
            require(success, "failed fun");
            x++;

            console.log(x);
        }
    }

    fallback() external payable {
        num++;
        console.log("num", num);
        (bool success, ) = victim.call(
            abi.encodeWithSignature("checkreentrancy()")
        );
        require(success, "failed fallback");
    }
}
