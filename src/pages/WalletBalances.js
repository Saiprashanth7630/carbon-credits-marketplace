import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { initializeBlockchain, getCarbonCredits, getEthBalance } from '../services/blockchainService';
import { supportedChains } from '../services/web3Config';
import './WalletBalances.css';

const WalletBalances = () => {
  const { 
    account, 
    active, 
    library, 
    chainId, 
    connect, 
    disconnect, 
    switchNetwork, 
    error: metaMaskError,
    isConnecting 
  } = useMetaMask();
  
  const [credits, setCredits] = useState([]);
  const [ethBalance, setEthBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);

  // Initialize contract when connected
  useEffect(() => {
    if (active && library) {
      initializeContract();
    }
  }, [active, library]);

  // Handle MetaMask errors
  useEffect(() => {
    if (metaMaskError) {
      setError(metaMaskError);
    }
  }, [metaMaskError]);

  const initializeContract = async () => {
    try {
      setLoading(true);
      const { contract } = await initializeBlockchain(library);
      setContract(contract);
      await refreshBalances();
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!contract || !account || !library) return;

    try {
      setLoading(true);
      setError('');
      
      // Get ETH balance
      const balance = await getEthBalance(library, account);
      setEthBalance(balance);

      // Get carbon credits
      const allCredits = await getCarbonCredits(contract);
      const userCredits = allCredits.filter(credit => 
        credit.owner.toLowerCase() === account.toLowerCase()
      );
      setCredits(userCredits);
    } catch (error) {
      console.error('Error getting balances:', error);
      setError('Failed to get balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError('');
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setCredits([]);
      setEthBalance('0');
      setContract(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  if (!active) {
    return (
      <div className="wallet-balances-container">
        <h2>Wallet Balances</h2>
        <p>Please connect your wallet to view your balances</p>
        <button 
          onClick={handleConnect} 
          className="connect-button"
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="wallet-balances-container">
      <h2>Wallet Balances</h2>
      
      {active && chainId !== supportedChains.GANACHE && (
        <div className="network-warning">
          <p>Please switch to Ganache network</p>
          <button 
            onClick={() => switchNetwork(supportedChains.GANACHE)}
            disabled={loading}
          >
            Switch Network
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="wallet-info">
        <div className="wallet-info-content">
          <p>Connected: {account}</p>
          <p>Balance: {ethBalance} ETH</p>
        </div>
        <button 
          onClick={handleDisconnect} 
          className="disconnect-button"
          disabled={loading}
        >
          Disconnect
        </button>
      </div>
      
      <div className="balances-section">
        <div className="balance-card">
          <h3>ETH Balance</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p className="balance-amount">{ethBalance} ETH</p>
          )}
        </div>

        <div className="balance-card">
          <h3>Carbon Credits</h3>
          {loading ? (
            <p>Loading...</p>
          ) : credits.length === 0 ? (
            <p>No credits found</p>
          ) : (
            <div className="credits-list">
              {credits.map((credit) => (
                <div key={credit.id} className="credit-item">
                  <p>Amount: {credit.amount}</p>
                  <p>Price: {credit.price} ETH</p>
                  <p>Status: {credit.isForSale ? 'For Sale' : 'Not For Sale'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={refreshBalances} 
        className="refresh-button"
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Balances'}
      </button>
    </div>
  );
};

export default WalletBalances; 