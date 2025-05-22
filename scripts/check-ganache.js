// Script to verify Ganache connection and settings
const { ethers } = require('ethers');

async function main() {
  try {
    // Connect to the already running Ganache instance
    console.log('Attempting to connect to Ganache on port 7545...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Get network information
    const network = await provider.getNetwork();
    console.log(`\nConnected successfully to network:`);
    console.log(`- Name: ${network.name}`);
    console.log(`- Chain ID: ${network.chainId}`);
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log(`\nFound ${accounts.length} accounts in Ganache:`);
    
    // Display account details and balances
    for (let i = 0; i < accounts.length; i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`\nAccount #${i}: ${accounts[i]}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    }
    
    // Check supported methods
    console.log('\nTesting Ganache for EIP-1559 support:');
    try {
      // Try to call eth_maxPriorityFeePerGas
      const result = await provider.send('eth_maxPriorityFeePerGas', []);
      console.log('Method eth_maxPriorityFeePerGas is supported:', result);
    } catch (error) {
      console.log('Method eth_maxPriorityFeePerGas is NOT supported');
      console.log('- This is expected with Ganache and our code now handles this');
    }
    
    console.log('\nMetaMask Configuration Instructions:');
    console.log('1. Add Ganache as a custom network in MetaMask:');
    console.log('   - Network Name: Ganache Local');
    console.log('   - RPC URL: http://127.0.0.1:7545');
    console.log(`   - Chain ID: ${network.chainId}`);
    console.log('   - Currency Symbol: ETH');
    
    console.log('\n2. Import one of the Ganache accounts using its private key:');
    console.log('   - Run the fix-account-display.js script to see private keys');
    console.log('   - Or check your Ganache UI for private keys');
    
    console.log('\n3. For transferring credits, use addresses from your Ganache instance');
    
  } catch (error) {
    console.error('\nError connecting to Ganache:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Ganache is running on port 7545');
    console.log('2. If you have issues with port 7545 being in use:');
    console.log('   - Check what process is using port 7545:');
    console.log('     On Windows: netstat -ano | findstr :7545');
    console.log('     On macOS/Linux: lsof -i :7545');
    console.log('   - Kill the process using that port or use a different port');
    console.log('3. If using a different port, update the URL in blockchainService.js');
  }
}

main(); 