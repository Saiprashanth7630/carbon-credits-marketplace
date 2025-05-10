import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
    hardhat: {
      chainId: 1337,
    },
    bbn_testnet: {
      url: "https://bbnrpc.testnet.bharatblockchain.io",
      chainId: 1998,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      timeout: 200_000,
    },
    linea_testnet: {
      url: process.env.LINEA_TESTNET_RPC_URL || "https://rpc.sepolia.linea.build",
      chainId: 59141, 
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      timeout: 200_000,
    },
  },
  paths: {
    artifacts: "../carbon-market-backend/API-Gateway/abi",
  },
};

export default config;
