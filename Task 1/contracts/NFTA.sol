// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract NFTA is ERC721{
    using Address for address;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenId;
    IERC20 token;
    uint price;
    constructor(IERC20 _token) ERC721('NFTA','NA'){
        price=3*10**18;
        token=_token;
    }
    function mint(address to) public returns(bool){
        require(!msg.sender.isContract(),"Caller is a Smart Contract");
        require(token.balanceOf(msg.sender)>=price,"Not Enough Tokens");
        require(to!=address(0),"ERC721: Mint to address zero");
        token.transferFrom(msg.sender,address(this),price);
        ITokenA(address(token)).burn(price);
        uint itemId=_tokenId.current();
        _mint(to,itemId);
        _tokenId.increment();
        return true;
    }
}
interface ITokenA{
    function burn(uint amount) external;
}
