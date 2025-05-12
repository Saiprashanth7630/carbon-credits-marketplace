const hre = require("hardhat");

async function main() {
  console.log("Deploying Carbon Credits Marketplace contract...");

  // Initial values for the contract
  const initialSupply = hre.ethers.parseEther("1000000"); // 1 million tokens
  const pricePerCredit = hre.ethers.parseEther("0.01"); // 0.01 ETH per credit

  // Deploy the contract
  const CarbonCreditsMarketplace = await hre.ethers.getContractFactory("CarbonCreditsMarketplace");
  const marketplace = await CarbonCreditsMarketplace.deploy(initialSupply, pricePerCredit);

  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("CarbonCreditsMarketplace deployed to:", address);
  
  // Additional deployment information
  console.log("\nDeployment Information:");
  console.log("Network:", hre.network.name);
  console.log("Initial Supply:", hre.ethers.formatEther(initialSupply), "tokens");
  console.log("Price per Credit:", hre.ethers.formatEther(pricePerCredit), "ETH");
  
  // Get deployer information
  const [deployer] = await hre.ethers.getSigners();
  console.log("\nDeployer Address:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 