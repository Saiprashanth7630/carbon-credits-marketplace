const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

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
  
  // Save deployment information to a log file
  const deploymentInfo = `
Deployment Information:
----------------------
Timestamp: ${new Date().toISOString()}
Contract: CarbonCreditsMarketplace
CarbonCreditsMarketplace deployed to: ${address}
Network: ${hre.network.name}
Initial Supply: ${hre.ethers.formatEther(initialSupply)} tokens
Price per Credit: ${hre.ethers.formatEther(pricePerCredit)} ETH
Deployer Address: ${deployer.address}
  `;
  
  // Save to a log file
  const logPath = path.join(__dirname, "../deployment-log.txt");
  fs.writeFileSync(logPath, deploymentInfo);
  console.log("\nDeployment information saved to:", logPath);
  
  // Run the frontend update script if on a local network
  if (hre.network.name === "localhost" || hre.network.name === "hardhat" || hre.network.name === "ganache") {
    console.log("\nUpdating frontend with contract information...");
    try {
      // Run the update-frontend script with the contract address
      const { execSync } = require("child_process");
      execSync(`node ${path.join(__dirname, "update-frontend.js")} ${address}`, { 
        encoding: "utf8",
        stdio: "inherit"
      });
    } catch (error) {
      console.error("Error updating frontend:", error.message);
      console.log("You can manually update the frontend by running:");
      console.log(`node scripts/update-frontend.js ${address}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 