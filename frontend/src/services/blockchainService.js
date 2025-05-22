/* eslint-disable no-undef */
import { ethers } from 'ethers';
import CarbonCreditsMarketplaceABI from './CarbonCreditsMarketplaceABI.json';
import { supportedChains } from './web3Config';
import { addTransaction as addTransactionToHistory } from './transactionService';

// Configuration
const CONFIG = {
  ganache: {
    rpcUrl: 'http://localhost:7545',
    chainId: 1337,
    contractAddress: '0xEd9d3bBa21e387B4554999035404452D5595D1F3'
  },
  gasConfiguration: {
    gasLimit: 3000000,
    gasPrice: ethers.utils.parseUnits('20', 'gwei')
  }
};

// Initialize blockchain connection
export const initializeBlockchain = async (provider) => {
  try {
    if (!provider) {
      throw new Error('Provider is required');
    }

    // Check if we're connected to the right network
    const network = await provider.getNetwork();
    console.log('Connected to network:', network);
    
    if (network.chainId !== CONFIG.ganache.chainId) {
      throw new Error(`Please connect to Ganache network (Chain ID: ${CONFIG.ganache.chainId})`);
    }

    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONFIG.ganache.contractAddress,
      CarbonCreditsMarketplaceABI,
      signer
    );

    // Verify contract connection and get initial price
    try {
      const price = await contract.pricePerCarbonCredit();
      console.log('Initial contract price:', ethers.utils.formatEther(price), 'ETH');
      
      if (price.toString() === '0') {
        console.warn('Contract price is set to 0. This might indicate an issue with the contract deployment.');
      }
    } catch (error) {
      console.error('Error verifying contract connection:', error);
      throw new Error('Failed to connect to the contract. Please make sure the contract is deployed and the address is correct.');
    }

    return { contract, signer };
  } catch (error) {
    console.error('Error initializing blockchain:', error);
    throw error;
  }
};

// Get carbon credits balance for multiple accounts
export const getAllCarbonCredits = async (contract) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Get the current connected account
    const signer = contract.signer;
    const currentAccount = await signer.getAddress();

    // Ganache default accounts plus current account
    const accounts = new Set([
      currentAccount, // Add current account first
      '0x4dAD8A3A437FeE4297b22A6b74dc00a7400E756A', // Deployer
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account 1
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account 2
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account 3
      '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'  // Account 4
    ]);

    // Get all transfer events to find additional addresses
    try {
      const filter = contract.filters.Transfer();
      const events = await contract.queryFilter(filter);
      
      // Add addresses from transfer events
      events.forEach(event => {
        accounts.add(event.args.from);
        accounts.add(event.args.to);
      });
    } catch (error) {
      console.warn('Could not fetch transfer events:', error);
      // Continue with default accounts if event fetching fails
    }

    const balances = await Promise.all(
      Array.from(accounts).map(async (account) => {
        try {
          const balance = await contract.carbonCredits(account);
          return {
            address: account,
            balance: balance.toString()
          };
        } catch (error) {
          console.error(`Error getting balance for ${account}:`, error);
          return {
            address: account,
            balance: '0'
          };
        }
      })
    );

    // Log balances for debugging
    console.log('Carbon Credits Balances:');
    balances.forEach(({ address, balance }) => {
      if (parseInt(balance) > 0) {
        console.log(`Address: ${address}`);
        console.log(`Balance: ${balance} credits`);
        console.log('---');
      }
    });

    return balances;
  } catch (error) {
    console.error('Error getting all carbon credits:', error);
    throw error;
  }
};

// Get carbon credits balance
export const getCarbonCredits = async (contract) => {
  try {
    if (!contract) {
      console.error('Contract not initialized in getCarbonCredits');
      throw new Error('Contract is not initialized');
    }

    const signer = contract.signer;
    const address = await signer.getAddress();
    console.log('Getting carbon credits for address:', address);
    
    // Get current user's balance using the contract's carbonCredits mapping
    const balance = await contract.carbonCredits(address);
    console.log('Raw balance from contract:', balance.toString());
    
    // Convert balance to number for easier comparison
    const balanceNum = parseInt(balance.toString());
    console.log('Parsed balance:', balanceNum);

    if (balanceNum === 0) {
      console.log('User has 0 credits');
      return [];
    }
    
    // Get the current price from the blockchain
    const price = await contract.pricePerCarbonCredit();
    const priceInEth = ethers.utils.formatEther(price);
    console.log('Current credit price from blockchain:', priceInEth, 'ETH');
    
    // Return the balance in a format expected by the UI
    const credits = [{
      id: 1,
      owner: address,
      amount: balance.toString(),
      price: priceInEth,
      isForSale: false
    }];
    
    console.log('Returning credits:', credits);
    return credits;
  } catch (error) {
    console.error('Error getting carbon credits:', error);
    if (error.message.includes('call revert exception')) {
      throw new Error('Failed to get carbon credits. Please make sure you are connected to the correct network and the contract is deployed.');
    }
    throw error;
  }
};

// Transfer credits
export const transferCredits = async (contract, to, amount) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Get sender's address
    const signer = contract.signer;
    const from = await signer.getAddress();

    // Check sender's balance first
    const senderBalance = await contract.carbonCredits(from);
    if (senderBalance.lt(amount)) {
      throw new Error('Insufficient carbon credits to complete the transfer');
    }

    console.log('Transfer details:', {
      from,
      to,
      amount: amount.toString(),
      senderBalance: senderBalance.toString(),
      contractAddress: contract.address
    });

    // Get the current gas price
    const gasPrice = await contract.signer.provider.getGasPrice();
    const gasLimit = CONFIG.gasConfiguration.gasLimit;

    console.log('Transaction parameters:', {
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString()
    });

    // Send the transaction using the contract's transferCarbonCredits function
    const tx = await contract.transferCarbonCredits(to, amount, {
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });

    console.log('Transaction sent:', tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // Add transaction to history for both sender and receiver
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    try {
      // Add transfer-out transaction for sender
      await addTransactionToHistory({
        walletAddress: from,
        type: 'transfer_out',
        amount: amount.toString(),
        description: `Transferred to ${to}`,
        transactionHash: tx.hash
      });

      // Add transfer-in transaction for receiver
      await addTransactionToHistory({
        walletAddress: to,
        type: 'transfer_in',
        amount: amount.toString(),
        description: `Received from ${from}`,
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error('Error adding transaction to history:', error);
      // Don't throw the error as the blockchain transaction was successful
    }

    return receipt;
  } catch (error) {
    console.error('Error transferring credits:', error);
    throw error;
  }
};

// Get credit price
export const getCreditPrice = async (contract) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    console.log('Getting credit price from contract:', CONFIG.ganache.contractAddress);
    const price = await contract.pricePerCarbonCredit();
    console.log('Raw price from contract:', price.toString());

    if (!price || price.toString() === '0') {
      console.warn('Credit price is 0. This might indicate an issue with the contract deployment or initialization.');
      throw new Error('Credit price is not set. Please contact the contract owner.');
    }

    const priceInEth = ethers.utils.formatEther(price);
    console.log('Current credit price:', priceInEth, 'ETH');
    return priceInEth;
  } catch (error) {
    console.error('Error getting credit price:', error);
    if (error.message.includes('call revert exception')) {
      throw new Error('Failed to get credit price. Please make sure you are connected to the correct network and the contract is deployed.');
    }
    throw error;
  }
};

// Update credit price (admin only)
export const updateCreditPrice = async (contract, newPrice) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Check if user is contract owner
    try {
      const signer = contract.signer;
      const userAddress = await signer.getAddress();
      const ownerAddress = await contract.owner();
      
      console.log('Contract owner check:');
      console.log('- Connected address:', userAddress);
      console.log('- Contract owner:', ownerAddress);
      console.log('- Is owner:', userAddress.toLowerCase() === ownerAddress.toLowerCase());
      
      if (userAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error(`Only the contract owner can update the price. Current owner: ${ownerAddress}`);
      }
    } catch (error) {
      if (error.message.includes('Only the contract owner')) {
        throw error;
      }
      console.error('Error checking contract owner:', error);
      // Continue anyway if we can't check owner
    }

    // Convert price to wei
    const priceInWei = ethers.utils.parseEther(newPrice.toString());
    
    console.log('Updating credit price to:', newPrice, 'ETH');
    console.log('Price in wei:', priceInWei.toString());
    
    // Get the current gas price
    const gasPrice = await contract.signer.provider.getGasPrice();
    const gasLimit = CONFIG.gasConfiguration.gasLimit;

    console.log('Transaction parameters:', {
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString()
    });

    // Send the transaction
    const tx = await contract.updatePrice(priceInWei, {
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });

    console.log('Price update transaction sent:', tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Price update confirmed:', receipt);

    return receipt;
  } catch (error) {
    console.error('Error updating credit price:', error);
    
    // More detailed error message handling
    if (error.code === -32603) {
      throw new Error('MetaMask RPC Error: This usually means you lack permission to perform this action. Are you the contract owner?');
    }
    
    if (error.message && error.message.includes('execution reverted')) {
      throw new Error('Contract execution reverted: You might not have permission or the contract rejected the operation');
    }
    
    if (error.message && error.message.includes('call revert exception')) {
      throw new Error('Only the contract owner can update the credit price');
    }
    
    throw error;
  }
};

// Get all wallet balances (admin only)
export const getAllWalletBalances = async (contract) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Get all transfer events to find unique addresses
    const filter = contract.filters.Transfer();
    const events = await contract.queryFilter(filter);
    
    // Get unique addresses from transfer events
    const addresses = new Set();
    events.forEach(event => {
      addresses.add(event.args.from);
      addresses.add(event.args.to);
    });

    // Get balances for all addresses
    const balances = await Promise.all(
      Array.from(addresses).map(async (address) => {
        try {
          const balance = await contract.carbonCredits(address);
          return {
            address,
            balance: balance.toString()
          };
        } catch (error) {
          console.error(`Error getting balance for ${address}:`, error);
          return {
            address,
            balance: '0'
          };
        }
      })
    );

    // Sort by balance (descending)
    balances.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));

    console.log('All wallet balances:', balances);
    return balances;
  } catch (error) {
    console.error('Error getting all wallet balances:', error);
    throw error;
  }
};

// Purchase credits
export const purchaseCredits = async (contract, amount, pricePerCredit) => {
  try {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Convert price to wei (smallest unit)
    const priceInWei = ethers.utils.parseEther(pricePerCredit.toString());
    const totalCost = priceInWei.mul(amount);
    
    console.log('Purchase details:', {
      amount,
      pricePerCredit,
      totalCost: totalCost.toString(),
      contractAddress: contract.address
    });

    // Get the current gas price
    const gasPrice = await contract.signer.provider.getGasPrice();
    const gasLimit = CONFIG.gasConfiguration.gasLimit;

    console.log('Transaction parameters:', {
      gasPrice: gasPrice.toString(),
      gasLimit: gasLimit.toString()
    });

    // Send the transaction using the contract's purchaseCarbonCredits function
    const tx = await contract.purchaseCarbonCredits(amount, {
      value: totalCost,
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });

    console.log('Transaction sent:', tx.hash);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // Add transaction to history
    const signer = contract.signer;
    const address = await signer.getAddress();
    
    try {
      await addTransactionToHistory({
        walletAddress: address,
        type: 'buy',
        amount: amount.toString(),
        description: `Purchased ${amount} credits for ${pricePerCredit} ETH each`,
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error('Error adding transaction to history:', error);
      // Don't throw the error as the blockchain transaction was successful
    }

    return receipt;
  } catch (error) {
    console.error('Error purchasing credits:', error);
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient ETH to complete the purchase');
    }
    if (error.message.includes('user rejected')) {
      throw new Error('Transaction was rejected by the user');
    }
    throw new Error(`Failed to purchase credits: ${error.message}`);
  }
};

// Get ETH balance
export const getEthBalance = async (provider, address) => {
  try {
    if (!provider || !address) {
      throw new Error('Provider and address are required');
    }

    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log('ETH Balance for', address, ':', formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    throw new Error('Failed to get ETH balance. Please make sure you are connected to the correct network.');
  }
};

// Check if connected to correct network
export const checkNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork();
    return network.chainId === supportedChains.GANACHE;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};