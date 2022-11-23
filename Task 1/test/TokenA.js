const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("token", async () => {
  let owner;
  let account1;
  let account2;
  let Token;
  beforeEach(async () => {
    [owner, account1, account2] = await ethers.getSigners();
    const token = await ethers.getContractFactory("TokenA");
    Token = await token.deploy();
    await Token.deployed();
    console.log(`Token deployed on ${Token.address}`);
  });

  it("should mint the tokens successfully", async () => {
    await Token.mint(account1.address, 1, { value: ethers.utils.parseUnits("0.15","ether") });
    let balance = await Token.balanceOf(account1.address);
    expect(BigInt(balance)).to.equal(BigInt(1 * 10 ** 18));
  });
  it('should revert if amount is zero',async()=>{
    await expect(Token.mint(owner.address,0)).to.be.revertedWith("Invalid amount");
  })
  it('should revert if amount is lesser than the amount',async()=>{
    await expect(Token.mint(account1.address, 1, { value: ethers.utils.parseUnits("0.14","ether") })).to.be.revertedWith("Not enough Balance")
  })
});
