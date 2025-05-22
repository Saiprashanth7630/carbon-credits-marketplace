import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import { initializeBlockchain, getCarbonCredits, transferCredits } from '../../services/blockchainService';
import { supportedChains } from '../../services/web3Config';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import './SellCredits.css';

const SellCredits = () => {
  const { account, active, library, chainId, switchNetwork, connect } = useMetaMask();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (active && library) {
      console.log('MetaMask connected, initializing contract...');
      initializeContract();
    }
  }, [active, library]);

  const initializeContract = async () => {
    try {
      console.log('Initializing blockchain...');
      const { contract } = await initializeBlockchain(library);
      console.log('Contract initialized:', contract.address);
      setContract(contract);
      await refreshCredits();
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract');
    }
  };

  const refreshCredits = async () => {
    if (!contract || !account) {
      console.log('Cannot refresh credits - contract or account missing:', { 
        hasContract: !!contract, 
        account 
      });
      return;
    }

    try {
      console.log('Refreshing credits for account:', account);
      setLoading(true);
      const userCredits = await getCarbonCredits(contract);
      console.log('Fetched credits:', userCredits);
      
      if (!userCredits || userCredits.length === 0) {
        console.log('No credits found for user');
        setCredits([]);
      } else {
        console.log('Setting credits:', userCredits);
        setCredits(userCredits);
      }
      setError('');
    } catch (error) {
      console.error('Error getting credits:', error);
      setError('Failed to get credit balance');
    } finally {
      setLoading(false);
    }
  };

  // Add effect to refresh credits when account changes
  useEffect(() => {
    if (contract && account) {
      console.log('Account changed, refreshing credits...');
      refreshCredits();
    }
  }, [account, contract]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!active) {
        throw new Error('Please connect your wallet first');
      }

      if (chainId !== supportedChains.GANACHE) {
        await switchNetwork(supportedChains.GANACHE);
        return;
      }

      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const amountNum = parseInt(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
        throw new Error('Please enter a valid recipient address');
      }

      // Check if user has enough credits
      const userCredits = await getCarbonCredits(contract);
      const userBalance = parseInt(userCredits[0].amount);
      
      if (amountNum > userBalance) {
        throw new Error(`Insufficient balance. You have ${userBalance} credits available.`);
      }

      const tx = await transferCredits(contract, recipient, amountNum);
      console.log('Transfer successful:', tx);
      
      setSuccess(`Successfully transferred ${amount} credits to ${recipient}`);
      setAmount('');
      setRecipient('');
      await refreshCredits();
    } catch (error) {
      console.error('Error transferring credits:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!active) {
    return (
      <div className="sell-credits-container">
        <h2>Sell/Transfer Credits</h2>
        <div className="connect-wallet-section">
          <p>Please connect your MetaMask wallet to transfer credits</p>
          <button 
            onClick={connect} 
            className="connect-wallet-button"
            disabled={loading}
          >
            <AccountBalanceWalletIcon /> Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-credits-container">
      <h2>Sell/Transfer Credits</h2>
      
      {active && chainId !== supportedChains.GANACHE && (
        <div className="network-warning">
          <p>Please switch to Ganache network</p>
          <button onClick={() => switchNetwork(supportedChains.GANACHE)}>
            Switch Network
          </button>
        </div>
      )}

      <div className="credits-summary">
        <h3>Your Credits</h3>
        {loading ? (
          <p>Loading credits...</p>
        ) : credits.length === 0 ? (
          <div>
            <p>No credits available</p>
            <p className="debug-info">Account: {account}</p>
            <p className="debug-info">Network: {chainId === supportedChains.GANACHE ? 'Ganache' : 'Other'}</p>
          </div>
        ) : (
          <div className="credits-list">
            {credits.map((credit) => (
              <div key={credit.id} className="credit-item">
                <p>Amount: {credit.amount}</p>
                <p>Price: {credit.price} ETH</p>
                <p>Status: {credit.isForSale ? 'For Sale' : 'Not For Sale'}</p>
                <p className="debug-info">Owner: {credit.owner}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleTransfer} className="transfer-form">
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
            disabled={!active || loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount to Transfer:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
            disabled={!active || loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          disabled={!active || loading || chainId !== supportedChains.GANACHE}
          className="transfer-button"
        >
          {loading ? 'Processing...' : 'Transfer Credits'}
        </button>
      </form>
    </div>
  );
};

export default SellCredits;