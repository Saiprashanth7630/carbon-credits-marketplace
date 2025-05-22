import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import { initializeBlockchain, getCreditPrice, purchaseCredits, getEthBalance } from '../../services/blockchainService';
import { supportedChains } from '../../services/web3Config';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { AccountBalanceWallet, SwapHoriz, ShoppingCart, Info } from '@mui/icons-material';
import axios from 'axios';

const BuyCredits = () => {
  const { connect, disconnect, account, chainId, active, library, switchNetwork } = useMetaMask();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('0');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState([]);
  
  useEffect(() => {
    if (active && library) {
      initializeContract();
    }
    fetchAvailableCredits();
  }, [active, library]);

  const initializeContract = async () => {
    try {
      const { contract } = await initializeBlockchain(library);
      setContract(contract);
      const price = await getCreditPrice(contract);
      setPrice(price);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract');
    }
  };

  const fetchAvailableCredits = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sell-requests/available');
      setAvailableCredits(response.data.totalAvailable || 0);
      setApprovedRequests(response.data.approvedRequests || []);
    } catch (error) {
      console.error('Error fetching available credits:', error);
      setError('Failed to fetch available credits');
    }
  };

  useEffect(() => {
    if (account && library) {
      updateBalance();
    }
  }, [account, library]);

  const updateBalance = async () => {
    try {
      const balance = await getEthBalance(library, account);
      setBalance(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!active) {
        await connect();
        return;
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
      
      // Check if there are enough available credits
      if (amountNum > availableCredits) {
        throw new Error(`Only ${availableCredits} credits available for purchase`);
      }

      const pricePerCredit = await getCreditPrice(contract);
      const token = localStorage.getItem('token');
      
      // Make purchase request to backend
      const purchaseResponse = await axios.post('http://localhost:5000/api/blockchain/purchase', {
        amount: amountNum,
        walletAddress: account
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Successfully purchased ${amountNum} carbon credits!`);
      setAmount('');
      await updateBalance();
      await fetchAvailableCredits();
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Buy Carbon Credits
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'info.light', p: 2, mb: 3, borderRadius: 1 }}>
          <Info sx={{ mr: 1 }} />
          <Typography variant="body2">
            You can only buy carbon credits that have been approved by admin verification.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Chip 
            label={`${availableCredits} Credits Available`} 
            color={availableCredits > 0 ? "success" : "warning"}
            variant="outlined"
            sx={{ fontSize: '1rem', py: 2, px: 1 }}
          />
        </Box>

        

        {!active ? (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AccountBalanceWallet />}
              onClick={connect}
              sx={{ px: 4, py: 1.5 }}
            >
              Connect MetaMask
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Connected Wallet
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {account}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Balance: {parseFloat(balance).toFixed(4)} ETH
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={disconnect}
              sx={{ mt: 1 }}
            >
              Disconnect
            </Button>
          </Box>
        )}

        {active && chainId !== supportedChains.GANACHE && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                startIcon={<SwapHoriz />}
                onClick={() => switchNetwork(supportedChains.GANACHE)}
              >
                Switch Network
              </Button>
            }
          >
            Please switch to Ganache network to continue
          </Alert>
        )}

        <Box component="form" onSubmit={handleBuy} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Amount of Credits"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!active || loading || availableCredits <= 0}
            InputProps={{
              inputProps: { min: 1, max: availableCredits }
            }}
            sx={{ mb: 2 }}
          />

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Price Information
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Price per credit:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {parseFloat(price).toFixed(6)} ETH
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total cost:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {amount ? (parseFloat(amount) * parseFloat(price)).toFixed(6) : '0'} ETH
              </Typography>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={
              !active || 
              loading || 
              chainId !== supportedChains.GANACHE || 
              availableCredits <= 0 ||
              !amount ||
              parseInt(amount) <= 0
            }
            startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCart />}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Processing...' : availableCredits <= 0 ? 'No Credits Available' : 'Buy Credits'}
          </Button>
        </Box>
        {approvedRequests.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Available Credit Listings
            </Typography>
            {approvedRequests.map((request) => (
              <Paper 
                key={request._id} 
                variant="outlined" 
                sx={{ p: 2, mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Amount:</strong> {request.amount} credits
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> {request.price} ETH per credit
                </Typography>
                <Typography variant="body2">
                  <strong>Total Value:</strong> {(request.amount * request.price).toFixed(4)} ETH
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Listed by: {request.userId?.fullName || 'Unknown User'}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BuyCredits;
