const fs = require('fs');
const path = require('path');

class CarbonCreditsContract {
  constructor(web3) {
    this.web3 = web3;
    this.init();
  }

  init() {
    try {
      // Load the contract ABI from the artifacts directory
      const abiPath = path.join(__dirname, '../../src/artifacts/carbon-market-backend/Blockchain/contracts/CarbonCreditsMarketplace.sol/CarbonCreditsMarketplace.json');
      if (!fs.existsSync(abiPath)) {
        console.error('Contract ABI not found at:', abiPath);
        return;
      }

      const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      const abi = contractJson.abi;

      // Use the contract address from the environment variable or default to the known address
      this.contractAddress = process.env.CONTRACT_ADDRESS || '0xEd9d3bBa21e387B4554999035404452D5595D1F3';
      this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
      console.log('CarbonCreditsContract initialized with address:', this.contractAddress);
    } catch (error) {
      console.error('Error initializing CarbonCreditsContract:', error);
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.contract.methods.carbonCredits(address).call();
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getPrice() {
    try {
      const price = await this.contract.methods.pricePerCarbonCredit().call();
      return price;
    } catch (error) {
      console.error('Error getting price:', error);
      throw error;
    }
  }

  async getTransferEvents(address, fromBlock = 0) {
    try {
      const events = await this.contract.getPastEvents('CarbonCreditTransferred', {
        filter: {
          $or: [
            { from: address },
            { to: address }
          ]
        },
        fromBlock,
        toBlock: 'latest'
      });
      return events;
    } catch (error) {
      console.error('Error getting transfer events:', error);
      return [];
    }
  }
}

module.exports = { CarbonCreditsContract }; 