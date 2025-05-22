import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Configure future flags for React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Ganache configuration
const GANACHE_RPC_URL = 'http://localhost:7545';
const GANACHE_CHAIN_ID = 1337;

// Create a singleton provider instance
let cachedProvider = null;

// Create ethers provider for Web3React with proper error handling
const getLibrary = (provider) => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Must be used in a browser environment');
    }

    // If we already have a cached provider, return it
    if (cachedProvider) {
      return cachedProvider;
    }

    // Check if MetaMask is installed and available
    if (window.ethereum && window.ethereum.isMetaMask) {
      // Create Web3Provider with explicit network configuration
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum, {
        name: 'ganache',
        chainId: GANACHE_CHAIN_ID
      });

      // Set a reasonable polling interval
      web3Provider.pollingInterval = 10000; // 10 seconds

      // Cache the provider
      cachedProvider = web3Provider;
      return web3Provider;
    }

    // If MetaMask is not available, create a fallback provider
    console.warn('MetaMask is not available. Using fallback provider.');
    const fallbackProvider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    fallbackProvider.pollingInterval = 10000; // 10 seconds

    // Cache the fallback provider
    cachedProvider = fallbackProvider;
    return fallbackProvider;

  } catch (error) {
    console.error('Error creating Web3Provider:', error);
    
    // If we have a cached provider, return it
    if (cachedProvider) {
      return cachedProvider;
    }

    // Create a new fallback provider
    const fallbackProvider = new ethers.providers.JsonRpcProvider(GANACHE_RPC_URL);
    fallbackProvider.pollingInterval = 10000; // 10 seconds

    // Cache the fallback provider
    cachedProvider = fallbackProvider;
    return fallbackProvider;
  }
};

// Listen for MetaMask installation
if (typeof window !== 'undefined') {
  window.addEventListener('ethereum#initialized', () => {
    // Clear the cached provider when MetaMask is initialized
    cachedProvider = null;
  }, { once: true });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter {...router}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
