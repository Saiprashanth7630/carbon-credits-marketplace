// Script to get Carbon Credits contract information
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x20D93A87cf2aFD7693B5eEC219a89E99af2CA807";
  console.log(`Checking Carbon Credits contract at: ${contractAddress}`);
  
  try {
    // Get the contract factory
    const CarbonCreditsMarketplace = await hre.ethers.getContractFactory("CarbonCreditsMarketplace");
    
    // Attach to the deployed contract
    const contract = CarbonCreditsMarketplace.attach(contractAddress);
    
    // Get contract information
    const price = await contract.pricePerCarbonCredit();
    const formattedPrice = hre.ethers.formatEther(price);
    
    console.log("\nContract Information:");
    console.log("====================");
    console.log(`Address: ${contractAddress}`);
    console.log(`Price per Credit: ${formattedPrice} ETH`);
    
    // Get deployer account
    const deployer = (await hre.ethers.getSigners())[0];
    const deployerAddress = await deployer.getAddress();
    
    // Get carbon credits for deployer
    const deployerCredits = await contract.carbonCredits(deployerAddress);
    const formattedCredits = hre.ethers.formatEther(deployerCredits);
    
    console.log(`\nDeployer (${deployerAddress}):`);
    console.log(`Available Credits: ${formattedCredits}`);
    
    console.log("\nContract is accessible and working correctly!");
    
  } catch (error) {
    console.error("\nError accessing contract:");
    console.error(error.message);
    console.log("\nPossible issues:");
    console.log("1. Contract not deployed at this address");
    console.log("2. Ganache not running or on wrong port");
    console.log("3. Contract ABI doesn't match the deployed contract");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 