import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMetaMask } from '../hooks/useMetaMask';
import { 
  initializeBlockchain,
  getAllCarbonCredits,
  getCreditPrice,
  getEthBalance
} from '../services/blockchainService';
import axios from 'axios';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const { account, connect, isConnecting, isConnected, provider } = useMetaMask();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    currentPrice: '0',
    contractBalance: '0'
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topWallets, setTopWallets] = useState([]);

  useEffect(() => {
    fetchStats();
    if (isConnected && provider) {
      initializeContract();
    }
  }, [isConnected, provider]);

  const initializeContract = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { contract } = await initializeBlockchain(provider);
      setContract(contract);
      
      if (contract) {
        await Promise.all([
          fetchCreditPrice(contract),
          fetchContractBalance(contract),
          fetchTopWallets(contract)
        ]);
      }
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError('Failed to initialize blockchain connection. Please check if Ganache is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Always get the latest token from localStorage
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');
      
      // Log first few characters of token for debugging (don't log entire token for security)
      if (token) {
        console.log(`Token preview: ${token.substring(0, 10)}...`);
      }
      
      const [usersResponse, transactionsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/management/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/management/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(prev => ({
        ...prev,
        totalUsers: usersResponse.data.length || 0,
        totalTransactions: transactionsResponse.data.length || 0
      }));
      
      // Get the 5 most recent transactions
      const sortedTransactions = transactionsResponse.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to fetch administrative data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditPrice = async (contract) => {
    try {
      const price = await getCreditPrice(contract);
      setStats(prev => ({ ...prev, currentPrice: price }));
    } catch (error) {
      console.error('Error fetching credit price:', error);
    }
  };
  
  const fetchContractBalance = async (contract) => {
    try {
      if (!provider || !contract) return;
      const balance = await getEthBalance(provider, contract.address);
      setStats(prev => ({ ...prev, contractBalance: balance }));
    } catch (error) {
      console.error('Error fetching contract balance:', error);
    }
  };
  
  const fetchTopWallets = async (contract) => {
    try {
      const balances = await getAllCarbonCredits(contract);
      const nonZeroBalances = balances
        .filter(wallet => parseInt(wallet.balance) > 0)
        .sort((a, b) => parseInt(b.balance) - parseInt(a.balance))
        .slice(0, 5);
      
      setTopWallets(nonZeroBalances);
    } catch (error) {
      console.error('Error fetching top wallets:', error);
    }
  };
  
  const refreshData = () => {
    setSuccess('Refreshing data...');
    fetchStats();
    if (contract) {
      Promise.all([
        fetchCreditPrice(contract),
        fetchContractBalance(contract),
        fetchTopWallets(contract)
      ]).then(() => {
        setSuccess('Data refreshed successfully');
        setTimeout(() => setSuccess(''), 3000);
      });
    } else {
      setTimeout(() => setSuccess(''), 3000);
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

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {adminUser?.fullName || 'Admin'}
            </Typography>
          </div>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isConnected ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={connect} 
                disabled={isConnecting}
              >
                {isConnecting ? <CircularProgress size={24} color="inherit" /> : 'Connect Wallet'}
              </Button>
            ) : (
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Connected: {formatAddress(account)}
              </Typography>
            )}
            
            <IconButton color="primary" onClick={refreshData} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3">{stats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h3">{stats.totalTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Credit Price
                </Typography>
                <Typography variant="h3">{stats.currentPrice} ETH</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contract Balance
                </Typography>
                <Typography variant="h3">{stats.contractBalance} ETH</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Admin Functions */}
        <Typography variant="h5" gutterBottom>
          Admin Functions
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate('/admin/users')}
            >
              <CardHeader 
                title="User Management" 
                avatar={<PeopleAltIcon color="primary" />} 
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Manage user accounts, roles, and permissions. View user details and transaction history.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate('/admin/transactions')}
            >
              <CardHeader 
                title="Transaction Management" 
                avatar={<ReceiptIcon color="primary" />} 
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Monitor and manage all carbon credit transactions. Generate reports and view transaction details.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate('/admin/settings')}
            >
              <CardHeader 
                title="System Settings" 
                avatar={<SettingsIcon color="primary" />} 
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Configure contract parameters, set credit prices, and withdraw funds from the smart contract.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
              }}
              onClick={() => navigate('/admin/credit-reviews')}
            >
              <CardHeader 
                title="Credit Sell Requests" 
                avatar={<FactCheckIcon color="primary" />} 
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Review and verify user requests to sell carbon credits. Approve or reject submissions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activity Section - Recent Transactions and Top Wallets */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Transactions" />
              <Divider />
              <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentTransactions.length > 0 ? (
                  <List>
                    {recentTransactions.map((tx, index) => (
                      <ListItem 
                        key={tx._id || index}
                        secondaryAction={
                          <IconButton edge="end" aria-label="view" size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={tx.type === 'buy' ? 'Purchase' : tx.type === 'sell' ? 'Sale' : tx.type}
                          secondary={`${tx.amount} credits - ${new Date(tx.date).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No recent transactions found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Credit Balances" />
              <Divider />
              <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                {topWallets.length > 0 ? (
                  <List>
                    {topWallets.map((wallet, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${wallet.balance} credits`}
                          secondary={formatAddress(wallet.address)}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    {isConnected ? 'No wallet data available' : 'Connect wallet to view data'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 