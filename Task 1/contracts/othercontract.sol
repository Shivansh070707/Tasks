// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
interface INFTA{
    function mint(address to) external;
}
contract OtherContract{
    INFTA nft;
    IERC20 token;
    constructor(INFTA _nft,IERC20 _token) {
        token=_token;
        nft=_nft;
    }
    function Mint() public {
        token.transferFrom(msg.sender,address(this),3*10**18);
        token.approve(address(nft),3*10**18);
        nft.mint(msg.sender);
    }
}