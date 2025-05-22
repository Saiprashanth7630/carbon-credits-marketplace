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
  Divider
} from '@mui/material';
import { useMetaMask } from '../hooks/useMetaMask';
import { 
  initializeBlockchain,
  getAllCarbonCredits,
  getCreditPrice,
  getEthBalance,
  updateCreditPrice
} from '../services/blockchainService';
import { ethers } from 'ethers';
import './AdminPortal.css';

const AdminPortal = () => {
  const { account, connect, isConnecting, isConnected, chainId, provider } = useMetaMask();
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletBalances, setWalletBalances] = useState([]);
  const [contractBalance, setContractBalance] = useState('0');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (isConnected && account && provider) {
      initializeContract();
    }
  }, [isConnected, account, provider]);

  const initializeContract = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { contract } = await initializeBlockchain(provider);
      setContract(contract);
      
      if (contract) {
        await Promise.all([
          fetchBalances(contract),
          fetchContractBalance(contract),
          fetchCurrentPrice(contract)
        ]);
      }
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError('Failed to initialize contract');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async (contract) => {
    try {
      const price = await getCreditPrice(contract);
      setCurrentPrice(price); // Price is already formatted in ETH
    } catch (err) {
      console.error('Error fetching current price:', err);
      setError('Failed to fetch current price');
    }
  };

  const fetchBalances = async (contract) => {
    try {
      const balances = await getAllCarbonCredits(contract);
      // Filter out zero balances and sort by balance
      const nonZeroBalances = balances
        .filter(wallet => parseInt(wallet.balance) > 0)
        .sort((a, b) => parseInt(b.balance) - parseInt(a.balance));
      setWalletBalances(nonZeroBalances);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch wallet balances');
    }
  };

  const fetchContractBalance = async (contract) => {
    try {
      if (!provider || !contract) {
        throw new Error('Provider and contract are required');
      }
      const balance = await getEthBalance(provider, contract.address);
      setContractBalance(balance); // Balance is already formatted in ETH
    } catch (err) {
      console.error('Error fetching contract balance:', err);
      setError('Failed to fetch contract balance');
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

      // Check if the connected wallet is the admin
      const isAdmin = await contract.isAdmin(account);
      if (!isAdmin) {
        throw new Error('Only admin can update prices');
      }

      const tx = await updateCreditPrice(contract, priceNum);
      await tx.wait();

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

      // Check if the connected wallet is the admin
      const isAdmin = await contract.isAdmin(account);
      if (!isAdmin) {
        throw new Error('Only admin can withdraw funds');
      }

      const tx = await contract.withdraw();
      await tx.wait();

      setSuccess('Funds withdrawn successfully');
      // Refresh balances after withdrawal
      await Promise.all([
        fetchBalances(contract),
        fetchContractBalance(contract)
      ]);
    } catch (err) {
      console.error('Error withdrawing funds:', err);
      setError(err.message || 'Failed to withdraw funds');
    } finally {
      setLoading(false);
    }
  };

  const formatEther = (wei) => {
    try {
      return ethers.utils.formatEther(wei || '0');
    } catch (err) {
      console.error('Error formatting ether:', err);
      return '0';
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Container maxWidth="lg" className="admin-portal-container">
      <Paper elevation={3} className="admin-portal-paper">
        <Box className="admin-portal-header">
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Portal
          </Typography>
          <Box className="connection-status">
            {!isConnected ? (
              <Button
                variant="contained"
                color="primary"
                onClick={connect}
                disabled={isConnecting}
                className="connect-button"
              >
                {isConnecting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Connect MetaMask'
                )}
              </Button>
            ) : (
              <Box className="wallet-info">
                <Typography variant="body1" color="textSecondary">
                  Connected: {formatAddress(account)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Chain ID: {chainId}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" className="admin-portal-alert">
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="admin-portal-alert">
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Price Management Section */}
          <Grid item xs={12} md={6}>
            <Card className="admin-portal-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Management
                </Typography>
                <Box className="current-price-display">
                  <Typography variant="subtitle1" color="textSecondary">
                    Current Price: {formatEther(currentPrice)} ETH
                  </Typography>
                </Box>
                <Box className="admin-portal-form">
                  <TextField
                    label="New Price (ETH)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={!isConnected || loading}
                    inputProps={{ step: "0.01", min: "0.01" }}
                    helperText="Enter price in ETH (e.g., 0.1)"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdatePrice}
                    disabled={!isConnected || loading || !price}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Price'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contract Balance Section */}
          <Grid item xs={12} md={6}>
            <Card className="admin-portal-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Balance
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatEther(contractBalance)} ETH
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleWithdraw}
                  disabled={!isConnected || loading || contractBalance === '0'}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Withdraw Funds'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Wallet Balances Section */}
          <Grid item xs={12}>
            <Card className="admin-portal-card">
              <CardContent>
                <Box className="admin-portal-header">
                  <Typography variant="h6">
                    Wallet Balances
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => contract && fetchBalances(contract)}
                    disabled={!isConnected || loading}
                  >
                    Refresh
                  </Button>
                </Box>
                <Divider className="admin-portal-divider" />
                {loading ? (
                  <Box className="admin-portal-loading">
                    <CircularProgress />
                  </Box>
                ) : walletBalances.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" align="center">
                    No wallet balances found
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {walletBalances.map((wallet) => (
                      <Grid item xs={12} sm={6} md={4} key={wallet.address}>
                        <Paper className="wallet-balance-item">
                          <Typography variant="subtitle2" noWrap title={wallet.address}>
                            {formatAddress(wallet.address)}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {wallet.balance} Credits
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminPortal; 