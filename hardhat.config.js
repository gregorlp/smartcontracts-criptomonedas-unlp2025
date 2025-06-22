require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

if (!process.env.SEPOLIA_RPC || !process.env.PRIVATE_KEY || !process.env.ETHERSCAN_API_KEY) {
  throw new Error("Faltan variables de entorno en .env (SEPOLIA_RPC, PRIVATE_KEY o ETHERSCAN_API_KEY)");
}

module.exports = {
  solidity: "0.8.21",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};