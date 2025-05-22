import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import { initializeBlockchain, getCarbonCredits } from '../../services/blockchainService';
import './CreditBalance.css';

const CreditBalance = () => {
  const { account, active, library } = useMetaMask();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (active && library) {
      initializeContract();
    }
  }, [active, library]);

  const initializeContract = async () => {
    try {
      const { contract } = await initializeBlockchain(library);
      setContract(contract);
      await refreshBalance();
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract');
    }
  };

  const refreshBalance = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const credits = await getCarbonCredits(contract);
      const userCredits = credits.filter(credit => credit.owner.toLowerCase() === account.toLowerCase());
      setCredits(userCredits);
      setError('');
    } catch (error) {
      console.error('Error getting credits:', error);
      setError('Failed to get credit balance');
    } finally {
      setLoading(false);
    }
  };

  if (!active) {
    return (
      <div className="credit-balance-container">
        <h3>Credit Balance</h3>
        <p>Please connect your wallet to view your credit balance</p>
      </div>
    );
  }

  return (
    <div className="credit-balance-container">
      <h3>Credit Balance</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p>Loading balance...</p>
      ) : (
        <div className="balance-info">
          {credits.length === 0 ? (
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
          <button onClick={refreshBalance} className="refresh-button">
            Refresh Balance
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditBalance; 