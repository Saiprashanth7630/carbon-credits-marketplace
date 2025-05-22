// Script to update the frontend with the deployed contract address
const fs = require('fs');
const path = require('path');

// Function to extract contract address from deployment log
function extractContractAddress(logFilePath) {
  try {
    if (!fs.existsSync(logFilePath)) {
      console.error(`Deployment log file not found at: ${logFilePath}`);
      return null;
    }

    const logContent = fs.readFileSync(logFilePath, 'utf8');
    const addressMatch = logContent.match(/CarbonCreditsMarketplace deployed to: (0x[a-fA-F0-9]{40})/);
    
    if (!addressMatch) {
      console.error('Contract address not found in deployment log');
      return null;
    }
    
    return addressMatch[1];
  } catch (error) {
    console.error('Error extracting contract address:', error);
    return null;
  }
}

// Function to update blockchainService.js with the new contract address
function updateFrontendService(serviceFilePath, contractAddress) {
  try {
    if (!fs.existsSync(serviceFilePath)) {
      console.error(`Frontend service file not found at: ${serviceFilePath}`);
      return false;
    }

    let serviceFileContent = fs.readFileSync(serviceFilePath, 'utf8');
    serviceFileContent = serviceFileContent.replace(
      /contractAddress: ['"]0x[a-fA-F0-9]{40}['"]/,
      `contractAddress: '${contractAddress}'`
    );
    
    fs.writeFileSync(serviceFilePath, serviceFileContent);
    console.log(`Updated frontend service with contract address: ${contractAddress}`);
    return true;
  } catch (error) {
    console.error('Error updating frontend service:', error);
    return false;
  }
}

// Function to copy the contract ABI to the frontend
function copyContractABI(sourceABIPath, targetABIPath) {
  try {
    if (!fs.existsSync(sourceABIPath)) {
      console.error(`Contract artifact not found at: ${sourceABIPath}`);
      return false;
    }

    const contractArtifact = JSON.parse(fs.readFileSync(sourceABIPath, 'utf8'));
    fs.writeFileSync(targetABIPath, JSON.stringify(contractArtifact.abi, null, 2));
    console.log('Copied contract ABI to frontend');
    return true;
  } catch (error) {
    console.error('Error copying contract ABI:', error);
    return false;
  }
}

// Main function to update the frontend
async function main() {
  const blockchainDir = __dirname; // Current directory (scripts)
  const projectRootDir = path.resolve(blockchainDir, '../../..'); // Back to project root
  
  console.log('Updating frontend with deployed contract information...');
  
  // Path to deployment log (you need to create this in your deploy.js script)
  const deploymentLogPath = path.join(blockchainDir, '../deployment-log.txt');
  
  // Extract contract address from deployment log
  const contractAddress = process.argv[2] || extractContractAddress(deploymentLogPath);
  
  if (!contractAddress) {
    console.error('Failed to get contract address. Please provide it as a command line argument.');
    console.log('Usage: node update-frontend.js 0xYourContractAddressHere');
    process.exit(1);
  }
  
  // Update frontend service with contract address
  const serviceFilePath = path.join(projectRootDir, 'src/services/blockchainService.js');
  const serviceUpdated = updateFrontendService(serviceFilePath, contractAddress);
  
  if (!serviceUpdated) {
    console.error('Failed to update frontend service file.');
    process.exit(1);
  }
  
  // Copy contract ABI to frontend
  const sourceABIPath = path.join(blockchainDir, '../artifacts/contracts/CarbonCreditsMarketplace.sol/CarbonCreditsMarketplace.json');
  const targetABIPath = path.join(projectRootDir, 'src/services/CarbonCreditsMarketplaceABI.json');
  const abiCopied = copyContractABI(sourceABIPath, targetABIPath);
  
  if (!abiCopied) {
    console.error('Failed to copy contract ABI to frontend.');
    process.exit(1);
  }
  
  console.log('Frontend successfully updated with contract information!');
  console.log(`Contract Address: ${contractAddress}`);
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error updating frontend:', error);
    process.exit(1);
  }); 