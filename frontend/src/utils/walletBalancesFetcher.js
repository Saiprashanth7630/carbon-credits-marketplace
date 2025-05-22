import { providers, utils, Contract } from 'ethers';
import CarbonCreditsMarketplaceABI from '../services/CarbonCreditsMarketplaceABI.json' with { type: 'json' };

// Configuration from blockchainService.js
const CONFIG = {
  contractAddress: '0xEd9d3bBa21e387B4554999035404452D5595D1F3',
  ganacheUrl: 'http://localhost:7545',
  chainId: 1337
};

// Ganache default accounts (these are the standard Ganache test accounts)
const GANACHE_ACCOUNTS = [
  '0x4dAD8A3A437FeE4297b22A6b74dc00a7400E756A', // Deployer
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
];

// No additional accounts needed

/**
 * Fetches carbon credit balances for all available wallet addresses
 * @returns {Promise<Array<{address: string, balance: string}>>} Array of wallet addresses and their balances
 */
export const fetchAllWalletBalances = async () => {
  try {
    // Connect to Ganache
    const provider = new providers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Create a contract instance with a read-only provider
    const contract = new Contract(
      CONFIG.contractAddress,
      CarbonCreditsMarketplaceABI,
      provider
    );
    
    // Prepare array to store results
    const balances = [];
    
    // Fetch balances for all accounts
    for (const address of GANACHE_ACCOUNTS) {
      try {
        // Get balance from the contract
        const creditsBigInt = await contract.carbonCredits(address);
        // Credits are stored as regular integers in the contract, not wei/ether
        const formattedBalance = creditsBigInt.toString();
        
        // Only add addresses with non-zero balances to keep the list clean
        if (creditsBigInt > 0) {
          balances.push({
            address: address,
            balance: formattedBalance
          });
        }
      } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error.message);
      }
    }
    
    // Sort balances from highest to lowest
    balances.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    
    return balances;
  } catch (error) {
    console.error("Failed to fetch wallet balances:", error);
    throw error;
  }
};

/**
 * Fetches ETH balances for all available wallet addresses
 * @returns {Promise<Array<{address: string, ethBalance: string}>>} Array of wallet addresses and their ETH balances
 */
export const fetchAllEthBalances = async () => {
  try {
    // Connect to Ganache
    const provider = new providers.JsonRpcProvider(CONFIG.ganacheUrl);
    
    // Prepare array to store results
    const balances = [];
    
    // Fetch ETH balances for Ganache accounts
    for (const address of GANACHE_ACCOUNTS) {
      try {
        const balanceWei = await provider.getBalance(address);
        const formattedBalance = utils.formatEther(balanceWei);
        
        balances.push({
          address: address,
          ethBalance: formattedBalance
        });
      } catch (error) {
        console.error(`Error fetching ETH balance for ${address}:`, error.message);
      }
    }
    
    // Sort balances from highest to lowest
    balances.sort((a, b) => parseFloat(b.ethBalance) - parseFloat(a.ethBalance));
    
    return balances;
  } catch (error) {
    console.error("Failed to fetch ETH balances:", error);
    throw error;
  }
}; 