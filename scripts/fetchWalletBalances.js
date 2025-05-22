// Script to fetch and display all wallet balances from the blockchain
import { fetchAllWalletBalances, fetchAllEthBalances } from '../src/utils/walletBalancesFetcher.js';

// Use ESM import in Node.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Table = require('cli-table3');

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
        address,
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
        address,
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