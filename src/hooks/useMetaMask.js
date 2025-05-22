import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { supportedChains } from '../services/web3Config';
import { metaMaskConnector } from '../connectors/metaMaskConnector';

export const useMetaMask = () => {
  const { activate, deactivate, account, library, active, chainId: web3ChainId } = useWeb3React();
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      deactivate();
      setIsConnected(false);
      setError('Wallet disconnected');
    } else {
      setIsConnected(true);
      setError(null);
    }
  }, [deactivate]);

  // Handle chain changes
  const handleChainChanged = useCallback(async (newChainId) => {
    try {
      console.log('Chain changed:', newChainId);
      const chainIdNum = typeof newChainId === 'string' ? parseInt(newChainId, 16) : newChainId;
      setChainId(chainIdNum);

      if (chainIdNum !== supportedChains.GANACHE) {
        setError(`Please switch to Ganache network (Chain ID: ${supportedChains.GANACHE})`);
        await switchNetwork(supportedChains.GANACHE);
      } else {
        setError(null);
        // Reload the page to ensure clean state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error handling chain change:', error);
      setError('Failed to switch network. Please switch to Ganache manually.');
    }
  }, []);

  // Handle disconnection
  const handleDisconnect = useCallback(() => {
    console.log('Wallet disconnected');
    deactivate();
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setError('Wallet disconnected');
  }, [deactivate]);

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if MetaMask is installed and unlocked
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          handleAccountsChanged(accounts);
          setChainId(parseInt(currentChainId, 16));
          
          // Create provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Check if we're on the right network
          if (parseInt(currentChainId, 16) !== supportedChains.GANACHE) {
            setError(`Please switch to Ganache network (Chain ID: ${supportedChains.GANACHE})`);
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
          setError('Failed to connect to MetaMask. Please make sure MetaMask is unlocked.');
        }
      } else {
        setError('MetaMask is not installed. Please install MetaMask to use this application.');
      }
    };

    checkConnection();
  }, [handleAccountsChanged]);

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to use this application.');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Activate MetaMask connector
      await activate(metaMaskConnector);
      setIsConnected(true);
      
      // Get current chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(currentChainId, 16);
      
      // Switch to Ganache if needed
      if (chainIdNum !== supportedChains.GANACHE) {
        await switchNetwork(supportedChains.GANACHE);
      }

      setChainId(chainIdNum);
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      if (error.code === 4001) {
        setError('Please connect to MetaMask to continue.');
      } else if (error.code === -32002) {
        setError('Please check MetaMask for pending connection request.');
      } else if (error.code === -32003) {
        setError('MetaMask is locked. Please unlock it and try again.');
      } else {
        setError('Failed to connect to MetaMask: ' + error.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [activate]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: 'Ganache',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:7545'],
            }],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw new Error('Failed to add Ganache network to MetaMask. Please add it manually.');
        }
      } else {
        throw switchError;
      }
    }
  }, []);

  // Disconnect from MetaMask
  const disconnect = useCallback(() => {
    deactivate();
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setError('Wallet disconnected');
  }, [deactivate]);

  return {
    account,
    isConnecting,
    isConnected,
    chainId,
    provider,
    library,
    active,
    error,
    connect,
    disconnect,
    switchNetwork
  };
}; 