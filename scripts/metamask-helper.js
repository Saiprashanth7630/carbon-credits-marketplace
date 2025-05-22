// Script to help configure MetaMask correctly
const { ethers } = require('ethers');

async function main() {
  try {
    // Connect to Ganache
    console.log('Connecting to Ganache...');
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    const network = await provider.getNetwork();
    console.log(`\nGanache Network Info:`);
    console.log(`- Chain ID: ${network.chainId}`);
    console.log(`- Network Name: ${network.name}`);
    
    console.log(`\n=== METAMASK CONFIGURATION GUIDE ===`);
    console.log(`1. Add a custom network in MetaMask with these settings:`);
    console.log(`   Network Name: Ganache Local`);
    console.log(`   RPC URL: http://127.0.0.1:7545`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Currency Symbol: ETH`);
    
    console.log(`\n2. Import a Ganache account using its private key:`);
    
    // Get accounts and display the first few with their private keys
    console.log(`\n   Available Ganache Accounts:`);
    
    // Use direct RPC call to get accounts
    const accounts = await provider.send('eth_accounts', []);
    
    // Deterministic private keys for Ganache
    const privateKeys = [
      "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
      "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
      "6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
      "646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
      "add53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743"
    ];
    
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
      const balance = await provider.getBalance(accounts[i]);
      console.log(`   Account #${i}: ${accounts[i]}`);
      console.log(`   Private Key: ${privateKeys[i]}`);
      console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);
    }
    
    // Test eth_maxPriorityFeePerGas method
    console.log('3. Checking EIP-1559 support in Ganache:');
    try {
      const result = await provider.send('eth_maxPriorityFeePerGas', []);
      console.log(`   - Method eth_maxPriorityFeePerGas is supported: ${result}`);
      console.log(`   - Your Ganache appears to support EIP-1559 features`);
    } catch (error) {
      console.log(`   - Method eth_maxPriorityFeePerGas is NOT supported (Expected error)`);
      console.log(`   - This is normal for standard Ganache deployments`);
      console.log(`   - Our application has been updated to handle this error`);
    }
    
    console.log(`\n4. When using the application with MetaMask:`);
    console.log(`   - Connect to the 'Ganache Local' network in MetaMask`);
    console.log(`   - For the sender, use the account you imported into MetaMask`);
    console.log(`   - For the recipient, use another address from the Ganache accounts list`);
    console.log(`   - Our code now handles the eth_maxPriorityFeePerGas error automatically`);
    
    console.log(`\n5. If you encounter issues, try:`);
    console.log(`   - Refreshing the browser page`);
    console.log(`   - Restarting the application with 'npm run dev'`);
    console.log(`   - Reconnecting MetaMask to the Ganache network`);
    console.log(`   - Resetting your MetaMask account (Settings > Advanced > Reset Account)`);
    
  } catch (error) {
    console.error('\nError:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Ganache is running on port 7545');
    console.log('2. Check if there are any port conflicts:');
    console.log('   - Windows: Run "netstat -ano | findstr :7545"');
    console.log('   - Linux/Mac: Run "lsof -i :7545"');
    console.log('3. Restart Ganache and try again');
  }
}

main(); 