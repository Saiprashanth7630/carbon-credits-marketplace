require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        // Replace with your actual private key from Ganache GUI (without 0x prefix)
        "6af70d37e07002f2497c4292f4b258d2403a784794476e086e624ee5273d3c46"
      ]
    },
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  }
}; 