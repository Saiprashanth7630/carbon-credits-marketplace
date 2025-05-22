import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import { useMetaMask } from '../hooks/useMetaMask';
import { 
  initializeBlockchain,
  getCreditPrice,
  updateCreditPrice,
  getEthBalance
} from '../services/blockchainService';
import { ethers } from 'ethers';

const AdminSettings = () => {
  const { account, connect, isConnecting, isConnected, provider } = useMetaMask();
  
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('0');
  const [contractBalance, setContractBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [contractOwner, setContractOwner] = useState('');
  
  useEffect(() => {
    if (isConnected && provider) {
      initializeContract();
    }
  }, [isConnected, provider]);
  
  const initializeContract = async () => {
    try {
      if (!provider) return;
      
      const { contract, signer } = await initializeBlockchain(provider);
      setContract(contract);
      
      console.log('Blockchain initialized with account:', account);
      
      await fetchCurrentPrice(contract);
      await fetchContractBalance(contract);
      await checkContractOwner(contract);
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message || 'Failed to initialize blockchain connection');
    }
  };
  
  const fetchCurrentPrice = async (contract) => {
    try {
      const price = await getCreditPrice(contract);
      setCurrentPrice(price);
    } catch (err) {
      console.error('Error fetching current price:', err);
      setError('Failed to fetch current price');
    }
  };
  
  const fetchContractBalance = async (contract) => {
    try {
      if (!provider || !contract) return;
      const balance = await getEthBalance(provider, contract.address);
      setContractBalance(balance);
    } catch (err) {
      console.error('Error fetching contract balance:', err);
    }
  };
  
  const checkContractOwner = async (contract) => {
    try {
      if (!contract) return;
      
      const owner = await contract.owner();
      setContractOwner(owner);
      console.log('Contract owner:', owner);
      
      // Check if connected account is owner
      const signer = contract.signer;
      const account = await signer.getAddress();
      const isOwner = owner.toLowerCase() === account.toLowerCase();
      console.log('Connected account is owner:', isOwner);
      
      if (!isOwner) {
        setError(`Warning: Your connected account (${account}) is not the contract owner (${owner}). You may not have permission to update the price.`);
      }
    } catch (err) {
      console.error('Error checking contract owner:', err);
    }
  };
  
  const handleUpdatePrice = async () => {
    if (!isConnected || !contract) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validate price input
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }
      
      // Debug info
      const signer = contract.signer;
      const currentAccount = await signer.getAddress();
      console.log('Updating price as account:', currentAccount);
      console.log('Contract owner is:', contractOwner);
      console.log('Is account owner:', currentAccount.toLowerCase() === contractOwner.toLowerCase());
      
      console.log('Attempting to update price to:', priceNum, 'ETH');
      const receipt = await updateCreditPrice(contract, priceNum);
      // No need to call receipt.wait() as updateCreditPrice already does this
      
      setSuccess('Price updated successfully');
      setPrice('');
      await fetchCurrentPrice(contract);
    } catch (err) {
      console.error('Error updating price:', err);
      setError(err.message || 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };
  
  const handleWithdraw = async () => {
    if (!isConnected || !contract) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const tx = await contract.withdraw();
      await tx.wait();
      
      setSuccess('Funds withdrawn successfully');
      await fetchContractBalance(contract);
    } catch (err) {
      console.error('Error withdrawing funds:', err);
      setError(err.message || 'Failed to withdraw funds');
    } finally {
      setLoading(false);
    }
  };
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Settings
          </Typography>
          
          {!isConnected ? (
            <Button
              variant="contained"
              color="primary"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Connect Wallet'
              )}
            </Button>
          ) : (
            <Typography variant="body2">
              Connected: {formatAddress(account)}
            </Typography>
          )}
        </Box>
        
        <Grid container spacing={4}>
          {/* Price Management Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Credit Price Management
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Price: {currentPrice} ETH
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is the price users will pay per credit when purchasing from the contract.
                  </Typography>
                </Box>
                
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel htmlFor="price-input">New Price</InputLabel>
                  <OutlinedInput
                    id="price-input"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
                    label="New Price"
                    inputProps={{ min: 0.00001, step: 0.00001 }}
                  />
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdatePrice}
                  disabled={loading || !isConnected}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Price'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Contract Balance Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Balance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Balance: {contractBalance} ETH
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is the total ETH held by the contract from credit purchases.
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleWithdraw}
                  disabled={loading || !isConnected || parseFloat(contractBalance) === 0}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Withdraw All Funds'}
                </Button>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Note: Only the contract owner can withdraw funds. Funds will be sent to your connected wallet address.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Other Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" paragraph>
                  The contract is currently deployed at: {contract ? contract.address : 'Loading...'}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Contract owner: {contractOwner ? formatAddress(contractOwner) : 'Loading...'}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Your account: {account ? formatAddress(account) : 'Not connected'}
                </Typography>
                
                <Typography variant="body1" color={contractOwner && account && contractOwner.toLowerCase() === account.toLowerCase() ? "success.main" : "error.main"} paragraph>
                  {contractOwner && account && contractOwner.toLowerCase() === account.toLowerCase() 
                    ? "✅ You are the contract owner"
                    : "⚠️ You are not the contract owner"}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  For additional contract settings or to deploy a new version, please contact the development team.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminSettings; 