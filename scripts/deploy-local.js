// Script to deploy the Carbon Credits Marketplace contract to local Ganache network
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

// Main function
async function main() {
  console.log(`${colors.bright}${colors.cyan}Carbon Credits Marketplace - Local Deployment${colors.reset}\n`);
  
  try {
    // Step 1: Navigate to the Blockchain directory
    console.log(`${colors.yellow}Step 1: Navigating to Blockchain directory...${colors.reset}`);
    const blockchainDir = path.join(__dirname, '../carbon-market-backend/Blockchain');
    process.chdir(blockchainDir);
    console.log(`Current directory: ${process.cwd()}`);
    
    // Step 2: Run the Hardhat deployment script
    console.log(`\n${colors.yellow}Step 2: Deploying contract to Ganache...${colors.reset}`);
    const deployOutput = execSync('npx hardhat run scripts/deploy.js --network ganache', { encoding: 'utf8' });
    console.log(deployOutput);
    
    // Step 3: Extract contract address from deployment output
    console.log(`\n${colors.yellow}Step 3: Extracting contract address...${colors.reset}`);
    const addressMatch = deployOutput.match(/CarbonCreditsMarketplace deployed to: (0x[a-fA-F0-9]{40})/);
    if (!addressMatch) {
      throw new Error('Contract address not found in deployment output');
    }
    
    const contractAddress = addressMatch[1];
    console.log(`${colors.green}Contract successfully deployed to: ${contractAddress}${colors.reset}`);
    
    // Step 4: Update the blockchainService.js file with the new contract address
    console.log(`\n${colors.yellow}Step 4: Updating blockchainService.js with new contract address...${colors.reset}`);
    const serviceFilePath = path.join(__dirname, '../src/services/blockchainService.js');
    
    let serviceFileContent = fs.readFileSync(serviceFilePath, 'utf8');
    serviceFileContent = serviceFileContent.replace(
      /contractAddress: ['"]0x[a-fA-F0-9]{40}['"]/,
      `contractAddress: '${contractAddress}'`
    );
    
    fs.writeFileSync(serviceFilePath, serviceFileContent);
    console.log(`${colors.green}Updated blockchainService.js with new contract address${colors.reset}`);
    
    // Step 5: Copy the ABI to the frontend services directory
    console.log(`\n${colors.yellow}Step 5: Copying contract ABI to frontend...${colors.reset}`);
    const abiSourcePath = path.join(blockchainDir, 'artifacts/contracts/CarbonCreditsMarketplace.sol/CarbonCreditsMarketplace.json');
    const abiTargetPath = path.join(__dirname, '../src/services/CarbonCreditsMarketplaceABI.json');
    
    const contractArtifact = JSON.parse(fs.readFileSync(abiSourcePath, 'utf8'));
    fs.writeFileSync(abiTargetPath, JSON.stringify(contractArtifact.abi, null, 2));
    console.log(`${colors.green}Contract ABI copied to frontend services directory${colors.reset}`);
    
    // Final step: Deployment completed
    console.log(`\n${colors.bright}${colors.green}Deployment completed successfully!${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}Contract Address: ${contractAddress}${colors.reset}`);
    console.log(`\n${colors.cyan}You can now run your frontend application and interact with the contract.${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Deployment failed:${colors.reset}`, error.message);
    console.error(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log("1. Make sure Ganache is running on http://127.0.0.1:7545");
    console.log("2. Check that the private key in hardhat.config.js matches an account in your Ganache instance");
    console.log("3. Ensure all dependencies are installed (npm install in the Blockchain directory)");
    process.exit(1);
  }
}

// Run the deployment script
main(); 