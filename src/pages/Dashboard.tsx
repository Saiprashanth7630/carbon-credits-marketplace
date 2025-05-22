import React, { useState, useEffect, ChangeEvent, SetStateAction, Dispatch } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from '@mui/material';

// Mock blockchain service functions for now
const getCreditPrice = async (): Promise<number> => {
  // Mock implementation
  return 0.1;
};

const purchaseCredits = async (amount: number): Promise<boolean> => {
  // Mock implementation
  return true;
};

const transferCredits = async (amount: number, recipient: string): Promise<boolean> => {
  // Mock implementation
  return true;
};

interface BlockchainData {
  walletAddress: string;
  credits: number;
  creditPrice: number;
}

const Dashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [credits, setCredits] = useState<number>(0);
  const [creditPrice, setCreditPrice] = useState<number>(0);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMockData, setIsMockData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for now
        setWalletAddress('0x123...');
        setCredits(100);
        const price = await getCreditPrice();
        setCreditPrice(price);
      } catch (err) {
        setError('Failed to fetch blockchain data');
        setIsMockData(true);
      }
    };

    fetchData();
  }, []);

  const handlePurchaseAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPurchaseAmount(e.target.value);
  };

  const handleTransferAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferAmount(e.target.value);
  };

  const handleRecipientAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
  };

  const handlePurchaseCredits = async () => {
    if (!purchaseAmount) {
      setError('Please enter an amount to purchase');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(purchaseAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid purchase amount');
      }

      const success = await purchaseCredits(amount);
      if (success) {
        setSuccess('Credits purchased successfully');
        setCredits((prev: number) => prev + amount);
        setPurchaseAmount('');
      } else {
        throw new Error('Failed to purchase credits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase credits');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferCredits = async () => {
    if (!transferAmount || !recipientAddress) {
      setError('Please enter both amount and recipient address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid transfer amount');
      }

      if (amount > credits) {
        throw new Error('Insufficient credits');
      }

      const success = await transferCredits(amount, recipientAddress);
      if (success) {
        setSuccess('Credits transferred successfully');
        setCredits((prev: number) => prev - amount);
        setTransferAmount('');
        setRecipientAddress('');
      } else {
        throw new Error('Failed to transfer credits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>Dashboard</Typography>
        
        {isMockData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You are viewing demo data as no blockchain connection is available. 
            Transactions will be simulated.
          </Alert>
        )}
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Account Information</Typography>
            <Typography variant="body1">Wallet Address: {walletAddress}</Typography>
            <Typography variant="body1">Available Credits: {credits}</Typography>
            <Typography variant="body1">Credit Price: {creditPrice} ETH</Typography>
          </CardContent>
        </Card>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Purchase Carbon Credits</Typography>
          <TextField
            label="Purchase Amount"
            value={purchaseAmount}
            onChange={handlePurchaseAmountChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePurchaseCredits}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Purchase Credits'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mt={2}>
          <Typography variant="h6" gutterBottom>Transfer Carbon Credits</Typography>
          <TextField
            label="Transfer Amount"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <TextField
            label="Recipient Address"
            value={recipientAddress}
            onChange={handleRecipientAddressChange}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleTransferCredits}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Transfer Credits'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
