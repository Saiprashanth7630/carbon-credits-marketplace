// Script to fund an account with ETH
const { ethers } = require('ethers');

async function main() {
  try {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Account to fund
    const targetAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
    
    // Use the first account as the funder
    const funder = new ethers.Wallet(
      '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
      provider
    );
    
    // Check balances before transfer
    const initialTargetBalance = await provider.getBalance(targetAddress);
    const initialFunderBalance = await provider.getBalance(funder.address);
    
    console.log(`Target account ${targetAddress} initial balance: ${ethers.formatEther(initialTargetBalance)} ETH`);
    console.log(`Funder account ${funder.address} initial balance: ${ethers.formatEther(initialFunderBalance)} ETH`);
    
    // Send 10 ETH
    const amountToSend = ethers.parseEther("10.0");
    console.log(`Sending ${ethers.formatEther(amountToSend)} ETH to ${targetAddress}...`);
    
    const tx = await funder.sendTransaction({
      to: targetAddress,
      value: amountToSend,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits("1", "gwei")
    });
    
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Check balances after transfer
    const newTargetBalance = await provider.getBalance(targetAddress);
    const newFunderBalance = await provider.getBalance(funder.address);
    
    console.log(`Target account ${targetAddress} new balance: ${ethers.formatEther(newTargetBalance)} ETH`);
    console.log(`Funder account ${funder.address} new balance: ${ethers.formatEther(newFunderBalance)} ETH`);
    
    console.log('\nNow you can use the funded account for transactions.');
    
  } catch (error) {
    console.error('Error funding account:', error);
  }
}

main(); 