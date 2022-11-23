const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("token", async () => {
  let owner;
  let account1;
  let account2;
  let Token;
  let NFT;
  beforeEach(async () => {
    [owner, account1, account2] = await ethers.getSigners();
    const token = await ethers.getContractFactory("TokenA");
    Token = await token.deploy();
    await Token.deployed();
    console.log(`Token deployed on ${Token.address}`);

    const nft = await ethers.getContractFactory("NFTA");
    NFT = await nft.deploy(Token.address);
    await NFT.deployed();
    console.log(`NFT deployed on ${NFT.address}`);

    //minting the tokens;
    await Token.mint(account1.address, 100, { value: ethers.utils.parseUnits(`${0.15*100}`,"ether") });
    await Token.mint(owner.address, 100, { value: ethers.utils.parseUnits(`${0.15*100}`,"ether") });

    //approving the tokens to nft contract
    await Token.approve(NFT.address,BigInt(50*10**18));
    await Token.connect(account1).approve(NFT.address,BigInt(50*10**18));
 
  });
  it('should mint the tokens',async()=>{
    await NFT.mint(owner.address);
    await NFT.mint(owner.address);
    const owner0_ = await NFT.ownerOf(0);
    expect(owner0_).to.equal(owner.address);
    const owner1_ = await NFT.ownerOf(1);
    expect(owner1_).to.equal(owner.address);
  })
  it('should revert if caller is contract',async()=>{
    const OTHER= await ethers.getContractFactory('OtherContract');
    const other = await OTHER.deploy(NFT.address,Token.address);
    await other.deploy;
    await Token.approve(other.address,BigInt(3*10**18));
    await expect(other.Mint()).to.be.revertedWith("Caller is a Smart Contract")
  })
  it(`should revert if account dont have balance`,async()=>{
    await expect(NFT.connect(account2).mint(account2.address)).to.revertedWith("Not Enough Tokens")
  })
  it('should revert if minting to zero address',async()=>{
    await expect(NFT.mint(ethers.constants.AddressZero)).to.be.revertedWith("ERC721: Mint to address zero")
  })
  it('should fetch owner balance',async()=>{
    await NFT.mint(owner.address);
    await NFT.mint(owner.address);
    await NFT.mint(owner.address);
    const bal = await NFT.balanceOf(owner.address);
    expect(bal).to.equal(3);

  })


 
});