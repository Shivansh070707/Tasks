
const hre = require("hardhat");
//token deployed to 0x5Aa239FC81Ef17Dc25989C67324d8D55aA794Bb5
//NFT deployed to 0x9e24E856EC665EbB4B11C5F2D301835F7f445751


async function main() {
  
  const token = await hre.ethers.getContractFactory("TokenA");
  const Token = await token.deploy();

  await Token.deployed();

  console.log(
    `token deployed to ${Token.address}`
  );

  const NFT = await hre.ethers.getContractFactory("NFTA");
  const Nft = await NFT.deploy(Token.address);

  await Nft.deployed();

  console.log(
    `NFT deployed to ${Nft.address}`
  );

}
async function verify(){

  token ='0x5Aa239FC81Ef17Dc25989C67324d8D55aA794Bb5'
  nft='0x9e24E856EC665EbB4B11C5F2D301835F7f445751'
  
 
  
  // await hre.run("verify:verify", {
  //   address: token,
  //   constructorArguments: []

  // });
  await hre.run("verify:verify", {
    address: nft,
    constructorArguments: [
   token
    ],
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
