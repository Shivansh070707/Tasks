// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;
import "hardhat/console.sol";

interface IStratX {
    function checkreentrancy() external;
}

contract ReentrancyChecker {
    address victim;
    uint256 num;
    event Response(bool success, bytes data);

    constructor(address _victim) {
        victim = _victim;
    }

    function attack() public {
        IStratX(victim).checkreentrancy();
        // (bool success, bytes memory data) = victim.call(
        //     abi.encodeWithSignature("checkreentrancy()")
        // );
        // emit Response(success, data);
        // require(success, "failed fun");
    }

    fallback() external payable {
        num++;
        if (num < 4) {
            console.log("num", num);
            IStratX(victim).checkreentrancy();
            // (bool success, ) = victim.call(
            //     abi.encodeWithSignature("checkreentrancy()")
            // );
            // console.log("HIIIII");
            // require(success, "failed fallback");
        }
    }
}
