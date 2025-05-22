// Script to verify contract deployment and purchase carbon credits
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Read the ABI from the file system
const abiPath = path.join(__dirname, '../src/services/CarbonCreditsMarketplaceABI.json');
const CarbonCreditsMarketplaceABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Configuration from blockchainService.js
const CONFIG = {
  contractAddress: '0x7169cB2f6Cc2447DeBBF0b799964F8BC1DE6Df34',
  ganacheUrl: 'http://127.0.0.1:7545',
};

/**
 * Get all accounts from Ganache
 */
async function getGanacheAccounts() {
  try {
    console.log('Connecting to Ganache to fetch accounts...');
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    const accounts = await provider.send("eth_accounts", []);
    console.log(`Found ${accounts.length} accounts on Ganache`);
    
    // Also get their balances
    console.log("\nAccount Balances:");
    for (let i = 0; i < accounts.length; i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`${accounts[i]}: ${ethers.formatEther(balance)} ETH`);
    }
    
    return accounts;
  } catch (error) {
    console.error("Failed to get Ganache accounts:", error);
    return [];
  }
}

/**
 * Verify contract deployment
 */
async function verifyContractDeployment() {
  try {
    console.log(`\n🔍 Verifying contract at address: ${CONFIG.contractAddress}`);
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Check if the contract exists
    const code = await provider.getCode(CONFIG.contractAddress);
    
    if (code === '0x') {
      console.error('❌ Contract not found at the specified address!');
      console.error('\nPossible issues:');
      console.error('1. The contract has not been deployed to this network');
      console.error('2. The contract address in your configuration is incorrect');
      console.error('3. You are connecting to the wrong network');
      console.error('\nTo fix:');
      console.error('1. Make sure Ganache is running');
      console.error('2. Deploy your contract using the deployment script');
      console.error('3. Update the contract address in your configuration');
      return false;
    }
    
    console.log('✅ Contract code exists at the specified address.');
    
    // Try to instantiate the contract
    try {
      const contract = new ethers.Contract(
        CONFIG.contractAddress,
        CarbonCreditsMarketplaceABI,
        provider
      );
      
      // Try to call a read-only function to verify the contract interface
      const price = await contract.pricePerCarbonCredit();
      console.log(`✅ Contract verified! Current price per credit: ${ethers.formatEther(price)} ETH`);
      
      // Get contract owner
      try {
        const owner = await contract.owner();
        console.log(`✅ Contract owner: ${owner}`);
      } catch (err) {
        console.log(`Contract does not have an 'owner' function or returned an error: ${err.message}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to interact with the contract:', error.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verifying contract:', error.message);
    return false;
  }
}

/**
 * Check carbon credit balances for all accounts
 */
async function checkCreditBalances() {
  try {
    console.log('\n🔍 Checking carbon credit balances for all accounts...');
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    const accounts = await getGanacheAccounts();
    
    const contract = new ethers.Contract(
      CONFIG.contractAddress,
      CarbonCreditsMarketplaceABI,
      provider
    );
    
    console.log('\nCarbon Credit Balances:');
    for (const account of accounts) {
      try {
        const balance = await contract.carbonCredits(account);
        console.log(`${account}: ${ethers.formatEther(balance)} credits`);
      } catch (error) {
        console.error(`Error getting balance for ${account}:`, error.message);
      }
    }
    
    // Also check the special wallet
    try {
      console.log('\nChecking special wallet:');
      const specialWallet = "0x9790SpecialWalletAddress";
      console.log(`${specialWallet}: 9790.0 credits (hardcoded in app)`);
    } catch (error) {
      console.error('Error checking special wallet:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking balances:', error);
  }
}

/**
 * Provide instructions for purchasing credits
 */
function provideInstructions() {
  console.log('\n📋 Instructions for purchasing carbon credits:');
  console.log('1. Launch the application: npm start');
  console.log('2. Navigate to the "Buy Credits" page');
  console.log('3. Enter a private key for one of your Ganache accounts');
  console.log('   (Get this from your Ganache UI by clicking on the key icon for an account)');
  console.log('4. Enter the amount of credits you want to purchase');
  console.log('5. Click "Purchase Credits"');
  console.log('\n💡 After purchasing, run "npm run wallets" to see the updated balances');
}

async function main() {
  console.log('======= Carbon Credits Contract Test =======');
  
  // Verify contract deployment
  const isContractValid = await verifyContractDeployment();
  
  if (isContractValid) {
    // Check carbon credit balances
    await checkCreditBalances();
    
    // Provide instructions
    provideInstructions();
  } else {
    console.log('\n❌ Contract verification failed. Cannot proceed with further tests.');
  }
  
  console.log('\n======= Test Complete =======');
}

// Run the main function
main().catch(console.error); 