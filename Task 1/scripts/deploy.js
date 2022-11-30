const hre = require("hardhat");
const fs = require("fs");

fs.mkdir("Build", (err) => {
  console.log("File created");
});

//token deployed to 0x5Aa239FC81Ef17Dc25989C67324d8D55aA794Bb5  // network polygon
//NFT deployed to 0x9e24E856EC665EbB4B11C5F2D301835F7f445751
//
//token deployed to 0x48324c858a0a35eB42bB77ABEb4dae68Af749098 using truffle dashboard
//NFT deployed to 0x5039f99761A971b1ebb5487c66dEC12cD4A7a97c

async function main() {
  const token = await hre.ethers.getContractFactory("TokenA");
  const Token = await token.deploy();

  await Token.deployed();
  console.log(Token.address);

  const NFT = await hre.ethers.getContractFactory("NFTA");
  const Nft = await NFT.deploy(Token.address);

  await Nft.deployed();
  console.log(Nft.address);

  let tokenData = {
    address: Token.address,
    network: {
      name: Token.provider._network.name,
      chainId: Token.provider._network.chainId,
    },
    abi: JSON.parse(Token.interface.format("json")),
  };

  let NftData = {
    address: Nft.address,
    network: {
      name: Nft.provider._network.name,
      chainId: Nft.provider._network.chainId,
    },

    abi: JSON.parse(Token.interface.format("json")),
  };

  fs.writeFileSync("Build/Token.json", JSON.stringify(tokenData, null, "\t"));
  fs.writeFileSync("Build/Nft.json", JSON.stringify(NftData, null, "\t"));
}
async function verify() {
  token = "0xB36D3070D5F2A6587A831E7181456e6908a0d9F4";
  nft = "0x10CE0144d0f9f6B23433d50d7a69295AA15F655D";

  await hre.run("verify:verify", {
    address: token,
    constructorArguments: [],
  });
  // await hre.run("verify:verify", {
  //   address: nft,
  //   constructorArguments: [token],
  // });
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
