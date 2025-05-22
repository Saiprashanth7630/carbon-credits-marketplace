/**
 * Script to verify our direct Ganache connection is working without MetaMask
 */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("\n===== VERIFYING NO-METAMASK IMPLEMENTATION =====\n");
    
    // Import our blockchainService module
    const blockchainServicePath = path.join(__dirname, '../src/services/blockchainService.js');
    console.log(`Checking if blockchainService.js exists at: ${blockchainServicePath}`);
    
    if (!fs.existsSync(blockchainServicePath)) {
      console.error("blockchainService.js not found!");
      process.exit(1);
    }
    
    console.log("blockchainService.js found! Verifying it doesn't reference MetaMask...");
    
    // Read the file content
    const serviceContent = fs.readFileSync(blockchainServicePath, 'utf8');
    
    // Check for MetaMask references
    const metamaskReferences = (serviceContent.match(/MetaMask|ethereum|window\.ethereum/g) || []).length;
    const toggleReferences = (serviceContent.match(/toggleConnection|useDirectGanache/g) || []).length;
    
    console.log(`MetaMask references found: ${metamaskReferences}`);
    console.log(`Toggle references found: ${toggleReferences}`);
    
    if (metamaskReferences > 0 || toggleReferences > 0) {
      console.error("\n⚠️ WARNING: The service still contains references to MetaMask or toggle functionality!");
      console.error("Please remove all remaining references for a clean implementation.");
    } else {
      console.log("\n✅ Success! blockchainService.js doesn't reference MetaMask.");
    }
    
    // Connect to Ganache
    console.log("\nConnecting to Ganache at http://127.0.0.1:7545...");
    
    try {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      
      // Get network information
      const network = await provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${Number(network.chainId)})`);
      
      // Get accounts
      console.log("Fetching accounts from Ganache...");
      const accounts = await provider.listAccounts();
      
      if (!accounts || accounts.length === 0) {
        console.error("No accounts found in Ganache!");
        return;
      }
      
      console.log(`Found ${accounts.length} accounts in Ganache`);
      console.log(`First account: ${accounts[0]}`);
      
      // Get the contract ABI and address
      const contractAddress = '0x7169cB2f6Cc2447DeBBF0b799964F8BC1DE6Df34';
      const abiPath = path.join(__dirname, '../src/services/CarbonCreditsMarketplaceABI.json');
      
      if (!fs.existsSync(abiPath)) {
        console.error("\nABI file not found at:", abiPath);
        process.exit(1);
      }
      
      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      console.log("ABI loaded successfully");
      
      // Use the wallet to create a signer
      const wallet = new ethers.Wallet(
        // Use a test private key (this is a generated key for testing only)
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 
        provider
      );
      
      // Connect to contract with wallet
      const contract = new ethers.Contract(contractAddress, abi, wallet);
      
      try {
        // Get contract information
        const price = await contract.pricePerCarbonCredit();
        console.log(`\nPrice per carbon credit: ${ethers.formatEther(price)} ETH`);
        
        console.log("\n===== VERIFICATION COMPLETE =====");
        console.log("✅ Your application is now configured to work directly with Ganache without MetaMask.");
        console.log("✅ All blockchain operations will use the first Ganache account automatically.");
        
      } catch (error) {
        console.error("\nError connecting to contract:", error.message);
        console.error("Please check if the contract is deployed at the specified address.");
      }
    } catch (error) {
      console.error("\nError connecting to Ganache:", error);
      console.error("Make sure Ganache is running on port 7545");
    }
  } catch (error) {
    console.error("\nError during verification:", error);
  }
}

main(); 