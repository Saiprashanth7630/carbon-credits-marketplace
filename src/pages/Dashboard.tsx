import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import { ethers } from 'ethers';
import { blockchainService } from '../services/blockchainService';

const Dashboard = () => {
  const [balance, setBalance] = useState('0');
  const [creditPrice, setCreditPrice] = useState('0');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get user's wallet address from localStorage or context
  const userWalletAddress = localStorage.getItem('walletAddress') || '';

  useEffect(() => {
    if (userWalletAddress) {
      fetchBalanceAndPrice();
    }
  }, [userWalletAddress]);

  const fetchBalanceAndPrice = async () => {
    try {
      const [balanceResult, priceResult] = await Promise.all([
        blockchainService.getBalance(userWalletAddress),
        blockchainService.getCreditPrice(),
      ]);
      setBalance(balanceResult.toString());
      setCreditPrice(priceResult.toString());
    } catch (err) {
      setError('Failed to fetch balance and price');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
        setError('Please enter a valid amount to purchase.');
        setLoading(false);
        return;
      }
      // purchaseCredits expects amount as a number or string representing the number of tokens
      await blockchainService.purchaseCredits(purchaseAmount);
      setSuccess('Purchase successful!');
      await fetchBalanceAndPrice();
      setPurchaseAmount('');
    } catch (err) {
      setError('Failed to purchase credits');
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!transferAmount || parseFloat(transferAmount) <= 0) {
        setError('Please enter a valid amount to transfer.');
        setLoading(false);
        return;
      }
      if (!recipientAddress) {
        setError('Please enter a recipient address.');
        setLoading(false);
        return;
      }
      await blockchainService.transferCredits(recipientAddress, transferAmount);
      setSuccess('Transfer successful!');
      await fetchBalanceAndPrice();
      setTransferAmount('');
      setRecipientAddress('');
    } catch (err) {
      setError('Failed to transfer credits');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Grid2 container spacing={3}>
          {/* Balance and Price Card */}
          <Grid2 xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Account Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">Your Balance: {balance} Credits</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Current Price: {creditPrice} ETH per Credit
                </Typography>
              </Box>
            </Paper>
          </Grid2>

          {/* Purchase Credits Card */}
          <Grid2 xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Purchase Credits
              </Typography>
              <TextField
                fullWidth
                label="Amount to Purchase"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                sx={{ mt: 2 }}
                inputProps={{ min: 1, step: 'any' }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handlePurchase}
                disabled={loading || !purchaseAmount}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Purchase Credits'}
              </Button>
            </Paper>
          </Grid2>

          {/* Transfer Credits Card */}
          <Grid2 xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transfer Credits
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Recipient Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Grid2>
                <Grid2 xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount to Transfer"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    sx={{ mt: 1 }}
                    inputProps={{ min: 1, step: 'any' }}
                  />
                </Grid2>
              </Grid2>
              <Button
                fullWidth
                variant="contained"
                onClick={handleTransfer}
                disabled={loading || !transferAmount || !recipientAddress}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Transfer Credits'}
              </Button>
            </Paper>
          </Grid2>
        </Grid2>
      </Box>
    </Container>
  );
};

export default Dashboard;
