import { AbstractConnector } from '@web3-react/abstract-connector';
import { ethers } from 'ethers';

// Ganache configuration
const GANACHE_CHAIN_ID = 1337;
const GANACHE_RPC_URL = 'http://localhost:7545';
const GANACHE_NETWORK = {
  chainId: `0x${GANACHE_CHAIN_ID.toString(16)}`,
  chainName: 'Ganache',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: [GANACHE_RPC_URL],
  blockExplorerUrls: []
};

class MetaMaskConnector extends AbstractConnector {
  constructor() {
    super();
    this.handleChainChanged = this.handleChainChanged.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this._provider = null;
  }

  async activate() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
      }

      // Check if it's actually MetaMask
      if (!window.ethereum.isMetaMask) {
        throw new Error('Please use MetaMask to connect to this application.');
      }

      // Store provider reference
      this._provider = window.ethereum;

      // Set up event listeners
      this._provider.on('chainChanged', this.handleChainChanged);
      this._provider.on('accountsChanged', this.handleAccountsChanged);
      this._provider.on('disconnect', this.handleDisconnect);

      // Request account access
      const accounts = await this._provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      // Get current chain ID
      const chainId = await this._provider.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainId, 16);

      // Check if we're on the right network
      if (chainIdNum !== GANACHE_CHAIN_ID) {
        try {
          // Try to switch to Ganache network
          await this._provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: GANACHE_NETWORK.chainId }]
          });
        } catch (switchError) {
          // If the network is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await this._provider.request({
                method: 'wallet_addEthereumChain',
                params: [GANACHE_NETWORK]
              });
            } catch (addError) {
              console.error('Error adding Ganache network:', addError);
              throw new Error('Failed to add Ganache network to MetaMask. Please add it manually.');
            }
          } else {
            console.error('Error switching to Ganache network:', switchError);
            throw new Error('Failed to switch to Ganache network. Please switch manually.');
          }
        }
      }

      // Create Web3Provider with proper configuration
      const provider = new ethers.providers.Web3Provider(this._provider, {
        name: 'ganache',
        chainId: GANACHE_CHAIN_ID
      });

      // Set polling interval for better responsiveness
      provider.pollingInterval = 10000; // 10 seconds

      // Return the provider and account information
      return {
        provider,
        chainId: GANACHE_CHAIN_ID,
        account: accounts[0]
      };
    } catch (error) {
      console.error('Error activating MetaMask connector:', error);
      
      // Provide user-friendly error messages
      if (error.code === 4001) {
        throw new Error('Please connect to MetaMask to continue.');
      } else if (error.code === -32002) {
        throw new Error('Please check MetaMask for pending connection request.');
      } else if (error.code === -32003) {
        throw new Error('MetaMask is locked. Please unlock it and try again.');
      }
      
      throw error;
    }
  }

  async getProvider() {
    if (!this._provider) {
      throw new Error('Provider not initialized. Please connect to MetaMask first.');
    }
    return this._provider;
  }

  async getChainId() {
    if (!this._provider) {
      throw new Error('Provider not initialized. Please connect to MetaMask first.');
    }
    const chainId = await this._provider.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  }

  async getAccount() {
    if (!this._provider) {
      throw new Error('Provider not initialized. Please connect to MetaMask first.');
    }
    const accounts = await this._provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect to MetaMask.');
    }
    return accounts[0];
  }

  handleChainChanged(chainId) {
    const chainIdNum = parseInt(chainId, 16);
    console.log('Chain changed:', chainIdNum);
    this.emitUpdate({ chainId: chainIdNum });
  }

  handleAccountsChanged(accounts) {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      this.emitDeactivate();
    } else {
      this.emitUpdate({ account: accounts[0] });
    }
  }

  handleDisconnect(error) {
    console.log('Disconnected from MetaMask:', error);
    this.emitDeactivate();
  }

  deactivate() {
    if (this._provider) {
      this._provider.removeListener('chainChanged', this.handleChainChanged);
      this._provider.removeListener('accountsChanged', this.handleAccountsChanged);
      this._provider.removeListener('disconnect', this.handleDisconnect);
      this._provider = null;
    }
  }
}

// Create and export a singleton instance
export const metaMaskConnector = new MetaMaskConnector(); 