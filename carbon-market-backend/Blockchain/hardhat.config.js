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
        "aa71e3bea55d9ba11ba79379dce30ce655dbb970f28621c2ee7daf43b22ca607"
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