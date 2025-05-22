// Simple script to get the deterministic Ganache accounts and private keys
const { ethers } = require('ethers');

async function main() {
  try {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get network information
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})\n`);
    
    // Get accounts using eth_accounts method
    const accounts = await provider.send("eth_accounts", []);
    console.log(`Found ${accounts.length} accounts:\n`);
    
    // Since we're not using the default Ganache accounts, we'll need to rely on
    // fetching the accounts and their balances only
    for (let i = 0; i < accounts.length; i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`Account #${i}: ${accounts[i]}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);
    }
    
    console.log("To get private keys for these accounts:");
    console.log("1. Open Ganache UI");
    console.log("2. Click on each account to see its private key");
    console.log("3. Use the private key in the application for testing");
    
  } catch (error) {
    console.error('Error accessing Ganache:', error);
  }
}

main(); 