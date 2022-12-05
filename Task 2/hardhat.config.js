require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/LeCpOxKARAdyrod1Pa2gRWQykFCky5wI",
        blockNumber: 14390000,
      },
    },
  },
};
