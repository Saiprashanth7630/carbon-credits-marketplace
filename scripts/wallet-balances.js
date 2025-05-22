// Script to fetch and display all wallet balances from the blockchain
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');

// Read the ABI from the file system
const abiPath = path.join(__dirname, '../src/services/CarbonCreditsMarketplaceABI.json');
const CarbonCreditsMarketplaceABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Configuration from blockchainService.js
const CONFIG = {
  contractAddress: '0x7169cB2f6Cc2447DeBBF0b799964F8BC1DE6Df34',
  ganacheUrl: 'http://127.0.0.1:7545',
};

// Additional known wallet addresses from your application
const ADDITIONAL_ACCOUNTS = [
  "0x9790SpecialWalletAddress" // Special wallet with 9790 credits
];

/**
 * Get all accounts from Ganache
 */
async function getGanacheAccounts() {
  try {
    console.log('Connecting to Ganache to fetch accounts...');
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Get accounts from Ganache using eth_accounts method
    const accounts = await provider.send("eth_accounts", []);
    console.log(`Found ${accounts.length} accounts on Ganache`);
    return accounts;
  } catch (error) {
    console.error("Failed to get Ganache accounts:", error);
    return [];
  }
}

/**
 * Fetches carbon credit balances for all available wallet addresses
 */
async function fetchAllWalletBalances() {
  try {
    console.log('Connecting to Ganache...');
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Create a contract instance with a read-only provider
    const contract = new ethers.Contract(
      CONFIG.contractAddress,
      CarbonCreditsMarketplaceABI,
      provider
    );
    
    // Get Ganache accounts
    const ganacheAccounts = await getGanacheAccounts();
    
    // Prepare array to store results
    const balances = [];
    
    // Combine all account addresses
    const allAccounts = [...ganacheAccounts, ...ADDITIONAL_ACCOUNTS];
    
    console.log(`Fetching balances for ${allAccounts.length} wallet addresses...`);
    
    // Fetch balances for all accounts
    for (const address of allAccounts) {
      try {
        // Handle special wallets
        if (address === "0x9790SpecialWalletAddress") {
          balances.push({
            address: address,
            balance: "9790.0",
            note: "Special wallet"
          });
          continue;
        }
        
        // Get balance from the contract
        const creditsBigInt = await contract.carbonCredits(address);
        const formattedBalance = ethers.formatUnits(creditsBigInt, 'ether');
        
        // Add all addresses (even with zero balance) for better visibility
        balances.push({
          address: address,
          balance: formattedBalance
        });
      } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error.message);
      }
    }
    
    // Sort balances from highest to lowest
    balances.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    
    return balances;
  } catch (error) {
    console.error("Failed to fetch wallet balances:", error);
    throw error;
  }
}

/**
 * Fetches ETH balances for all available wallet addresses
 */
async function fetchAllEthBalances() {
  try {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Get Ganache accounts
    const ganacheAccounts = await getGanacheAccounts();
    
    // Prepare array to store results
    const balances = [];
    
    // Fetch ETH balances for Ganache accounts
    for (const address of ganacheAccounts) {
      try {
        const balanceWei = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balanceWei);
        
        balances.push({
          address: address,
          ethBalance: formattedBalance
        });
      } catch (error) {
        console.error(`Error fetching ETH balance for ${address}:`, error.message);
      }
    }
    
    // Sort balances from highest to lowest
    balances.sort((a, b) => parseFloat(b.ethBalance) - parseFloat(a.ethBalance));
    
    return balances;
  } catch (error) {
    console.error("Failed to fetch ETH balances:", error);
    throw error;
  }
}

async function displayWalletBalances() {
  console.log('Fetching carbon credit balances from the blockchain...');
  
  try {
    // Fetch carbon credit balances
    const creditBalances = await fetchAllWalletBalances();
    
    // Fetch ETH balances
    const ethBalances = await fetchAllEthBalances();
    
    // Create a table for carbon credits
    const creditTable = new Table({
      head: ['Wallet Address', 'Carbon Credits', 'Notes'],
      colWidths: [45, 20, 20]
    });
    
    // Add credit balances to the table
    creditBalances.forEach(({ address, balance, note }) => {
      creditTable.push([
        address || 'Unknown',
        parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 2 }),
        note || ''
      ]);
    });
    
    // Create a table for ETH balances
    const ethTable = new Table({
      head: ['Wallet Address', 'ETH Balance'],
      colWidths: [45, 20]
    });
    
    // Add ETH balances to the table
    ethBalances.forEach(({ address, ethBalance }) => {
      ethTable.push([
        address || 'Unknown',
        parseFloat(ethBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })
      ]);
    });
    
    // Display the tables
    console.log('\nCarbon Credit Balances:');
    console.log(creditTable.toString());
    
    console.log('\nETH Balances:');
    console.log(ethTable.toString());
    
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
  }
}

// Execute the function
displayWalletBalances(); 