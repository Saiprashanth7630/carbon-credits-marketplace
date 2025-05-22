// Script to get Ganache accounts and private keys
const hre = require("hardhat");

async function main() {
  console.log("Fetching accounts from Ganache...");
  
  const accounts = await hre.ethers.getSigners();
  
  console.log("\nAccount Information:");
  console.log("===================");
  
  for (const [index, account] of accounts.entries()) {
    const address = await account.getAddress();
    const balance = await hre.ethers.provider.getBalance(address);
    const formattedBalance = hre.ethers.formatEther(balance);
    
    console.log(`\nAccount #${index}:`);
    console.log(`Address: ${address}`);
    console.log(`Balance: ${formattedBalance} ETH`);
    
    // Try to get the private key if possible through provider
    if (hre.network.name === "ganache" && hre.network.config.accounts) {
      // If we have a private key in the config, we can show it
      if (Array.isArray(hre.network.config.accounts) && index < hre.network.config.accounts.length) {
        console.log(`Private Key: ${hre.network.config.accounts[index]}`);
      } else if (typeof hre.network.config.accounts === "object" && hre.network.config.accounts.mnemonic) {
        console.log("Private Key: [Available in Ganache UI]");
      }
    }
  }
  
  console.log("\nTo get the private key for an account in Ganache UI:");
  console.log("1. Open Ganache");
  console.log("2. Click on the key icon next to an account");
  console.log("3. Copy the private key");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 