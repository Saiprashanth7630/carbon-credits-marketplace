import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * Transaction Service
 * Provides utilities for storing and retrieving transaction history
 */

/**
 * Get all transactions
 * @returns {Promise<Array>} Promise resolving to array of all transactions
 */
export const getAllTransactions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.transactions || [];
  } catch (error) {
    console.error("Error getting all transactions:", error);
    throw error;
  }
};

/**
 * Get transactions for a specific wallet
 * @param {string} walletAddress - The wallet address
 * @returns {Promise<Array>} Promise resolving to array of transactions for the wallet
 */
export const getTransactionsForWallet = async (walletAddress) => {
  try {
    if (!walletAddress) return [];
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/transactions/wallet/${walletAddress}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.transactions || [];
  } catch (error) {
    console.error("Error getting wallet transactions:", error);
    throw error;
  }
};

/**
 * Add a transaction
 * @param {object} transactionData - Transaction data
 * @param {string} transactionData.walletAddress - The wallet address
 * @param {string} transactionData.type - Transaction type ('buy', 'sell', 'transfer_in', 'transfer_out')
 * @param {number|string} transactionData.amount - Amount of credits
 * @param {string} transactionData.description - Optional transaction description
 * @param {string} transactionData.transactionHash - Optional blockchain transaction hash
 * @returns {Promise<object>} Promise resolving to the newly created transaction
 */
export const addTransaction = async (transactionData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // If a transaction hash is provided, check if we've recorded this transaction before
    // Client-side check to reduce unnecessary API calls
    if (transactionData.transactionHash) {
      try {
        // Try to get the wallet's transactions
        const walletTransactions = await getTransactionsForWallet(transactionData.walletAddress);
        
        // Check if we already have this transaction recorded
        const existingTransaction = walletTransactions.find(
          tx => tx.transactionHash === transactionData.transactionHash && 
               tx.type === transactionData.type
        );
        
        if (existingTransaction) {
          console.log('Transaction already recorded in history:', existingTransaction);
          return existingTransaction;
        }
      } catch (err) {
        // Continue with adding the transaction if the check fails
        console.warn('Could not check for duplicate transactions:', err);
      }
    }

    const response = await axios.post(`${API_URL}/transactions`, transactionData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.transaction;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}; 