/**
 * Simple script to directly test the Ganache connection
 * This doesn't require MetaMask, private keys, or complex configuration
 */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("\n===== TESTING DIRECT GANACHE CONNECTION =====\n");
    
    // Connect to Ganache
    console.log("Connecting to Ganache at http://127.0.0.1:7545...");
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get network information
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name);
    console.log("Chain ID:", Number(network.chainId));
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log(`\nFound ${accounts.length} accounts in Ganache:`);
    
    // Show account details
    for (let i = 0; i < Math.min(3, accounts.length); i++) {
      const address = accounts[i];
      const balance = await provider.getBalance(address);
      console.log(`\nAccount #${i}: ${address}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    }
    
    // Get the contract ABI and address
    console.log("\nLoading contract information...");
    
    // Contract address from our config
    const contractAddress = '0x7169cB2f6Cc2447DeBBF0b799964F8BC1DE6Df34';
    
    // Load ABI
    const abiPath = path.join(__dirname, '../src/services/CarbonCreditsMarketplaceABI.json');
    if (!fs.existsSync(abiPath)) {
      console.error("ABI file not found at:", abiPath);
      process.exit(1);
    }
    
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    console.log("ABI loaded successfully");
    
    // Private key to use (this is a default Hardhat test key)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    
    // Create wallet with private key
    console.log(`\nCreating wallet from private key...`);
    const wallet = new ethers.Wallet(privateKey, provider);
    const walletAddress = await wallet.getAddress();
    console.log(`Wallet address: ${walletAddress}`);
    
    // Connect to the contract
    console.log(`\nConnecting to contract at ${contractAddress}...`);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    // Get contract information
    try {
      const price = await contract.pricePerCarbonCredit();
      console.log(`Price per carbon credit: ${ethers.formatEther(price)} ETH`);
      
      const owner = await contract.owner();
      console.log(`Contract owner: ${owner}`);
      
      // Check carbon credits for each account
      console.log("\nChecking carbon credits balances:");
      for (let i = 0; i < Math.min(3, accounts.length); i++) {
        const credits = await contract.carbonCredits(accounts[i]);
        console.log(`Account #${i} (${accounts[i]}): ${ethers.formatUnits(credits, 'ether')} credits`);
      }
      
      console.log("\n===== SUCCESS! =====");
      console.log("Direct Ganache connection is working perfectly!\n");
      console.log("Your application is now configured to work directly with Ganache.");
      console.log("No MetaMask required - you can use the blockchain features directly.\n");
      
    } catch (error) {
      console.error("\nError connecting to contract:", error.message);
      console.error("Please check if the contract is deployed at the specified address.");
    }
    
  } catch (error) {
    console.error("\nConnection failed:", error.message);
    console.error("Make sure Ganache is running on port 7545");
  }
}

main(); 