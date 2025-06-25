require("@nomiclabs/hardhat-ethers");
require('@nomicfoundation/hardhat-verify');
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    base_sepolia: {
      url: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Uncomment and configure for testnet/mainnet
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    //   accounts: ["0xYOUR_PRIVATE_KEY"]
    // }
  },
  etherscan: {
    // You can get a BaseScan API key from https://docs.basescan.org/ (or use ETHERSCAN_API_KEY for other networks)
    apiKey: {
      base_sepolia: process.env.BASESCAN_API_KEY || "", // set in .env
    },
  },
};
