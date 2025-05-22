import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';

// Configure supported chains
export const supportedChains = {
  MAINNET: 1,
  GANACHE: 1337,
  HARDHAT: 31337
};

// Create MetaMask connector
export const injected = new InjectedConnector({
  supportedChainIds: [supportedChains.GANACHE, supportedChains.HARDHAT, supportedChains.MAINNET]
});

// Function to get library (provider)
export function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  
  // Handle chain changes using the newer method
  provider.on('chainChanged', (chainId) => {
    window.location.reload();
  });

  // Handle account changes using the newer method
  provider.on('accountsChanged', (accounts) => {
    window.location.reload();
  });

  // Handle disconnection using the newer method
  provider.on('disconnect', () => {
    window.location.reload();
  });

  return library;
}

// Web3 Provider component
export function Web3ProviderWrapper({ children }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {children}
    </Web3ReactProvider>
  );
} 