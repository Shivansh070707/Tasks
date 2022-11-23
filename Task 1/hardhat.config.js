require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const MATIC_PRIVATE_KEY =
  "83e2a2a92cf8b81f68dd13aa795b1be2cff51c2a444bdc63d84026736a821f60";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
      },
      {
        version: "0.8.14",
        settings: {},
      },
    ],
  },

  networks: {
    Mumbai: {
      url: "https://wiser-proud-sea.matic-testnet.discover.quiknode.pro/02c8f3feafa3227e22b53fc40e844333a15a6290/",

      chainId: 80001,
      accounts: [MATIC_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "E3Z2SMUGRBSGUJ3D3W6D67V6KXQTMR1WDZ",
    },
  },
};
