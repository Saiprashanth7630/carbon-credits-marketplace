import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMetaMask } from '../hooks/useMetaMask';
import { utils } from 'ethers';
import axios from 'axios';
import './Dashboard.css';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SellIcon from '@mui/icons-material/Sell';
import HistoryIcon from '@mui/icons-material/History';

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, provider, chainId } = useMetaMask();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    creditBalance: '0',
    ethBalance: '0',
    recentTransactions: []
  });

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(token && user));
  }, []);

  // Fetch user data only if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;

      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        // Fetch user's credit balance and transactions
        const [balanceResponse, transactionsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/blockchain/balance`, {
            headers: { Authorization: `Bearer ${token}` },
            params: account ? { address: account } : undefined
          }).catch(err => ({ data: { balance: '0' } })), // Default to 0 if error
          axios.get(`http://localhost:5000/api/transactions/recent`, {
            headers: { Authorization: `Bearer ${token}` },
            params: account ? { address: account } : undefined
          }).catch(err => ({ data: { transactions: [] } })) // Default to empty array if error
        ]);
        
        setUserData(prev => ({
          ...prev,
          creditBalance: balanceResponse.data.balance || '0',
          recentTransactions: transactionsResponse.data?.transactions || []
        }));

        // Only fetch ETH balance if wallet is connected
        if (account && provider) {
          try {
            const balance = await provider.getBalance(account);
            setUserData(prev => ({
              ...prev,
              ethBalance: utils.formatEther(balance)
            }));
          } catch (err) {
            console.error('Error fetching ETH balance:', err);
          }
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, account, provider]);

  const handleBuyCredits = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!account) {
      setError('Please connect your wallet to buy credits');
      return;
    }
    navigate('/app/buy-credits');
  };

  const handleViewTransactions = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/app/transactions');
  };

  const handleSellRequestSubmission = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!account) {
      setError('Please connect your wallet to submit a sell request');
      return;
    }
    navigate('/app/sell-request');
  };

  if (loading) {
    return (
      <Container className="dashboard-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="dashboard-container">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        {error.includes('Please login') && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        )}
      </Container>
    );
  }

  return (
    <Container className="dashboard-container">
      <Box className="dashboard-header" sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Carbon Credits Marketplace
        </Typography>
        <Typography variant="h5" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
          Trade carbon credits securely on the blockchain
        </Typography>
        {!isLoggedIn && (
          <Box mt={4}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2, px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5 }}
            >
              Login
            </Button>
          </Box>
        )}
      </Box>

      {isLoggedIn ? (
        <Grid container spacing={3}>
          {/* Balance Overview */}
          <Grid item xs={12} md={6}>
            <Card className="balance-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Balances
                </Typography>
                <Box className="balance-item">
                  <Typography variant="body1">Carbon Credits</Typography>
                  <Typography variant="h5">{userData.creditBalance} Credits</Typography>
                </Box>
                {account && (
                  <Box className="balance-item">
                    <Typography variant="body1">ETH Balance</Typography>
                    <Typography variant="h5">{parseFloat(userData.ethBalance).toFixed(4)} ETH</Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleBuyCredits}
                  fullWidth
                  disabled={!account}
                >
                  {account ? 'Buy Credits' : 'Connect Wallet to Buy'}
                </Button>
                <Button 
                                    variant="outlined"                   color="primary"                   onClick={handleSellRequestSubmission}                  fullWidth                  disabled={!account}                >                  {account ? 'Register Generated Credits' : 'Connect Wallet to Register'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Card className="transactions-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                {userData.recentTransactions.length > 0 ? (
                  userData.recentTransactions.map((tx, index) => (
                    <Box key={tx.id || index} className="transaction-item">
                      <Typography variant="body2">
                        {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.amount} credits
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Typography>
                      <Divider />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No recent transactions
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={handleViewTransactions}
                  fullWidth
                >
                  View All Transactions
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card className="actions-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/app/marketplace')}
                    >
                      Browse Marketplace
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                                            variant="contained"                      color="secondary"                      fullWidth                      onClick={handleSellRequestSubmission}                      disabled={!account}                    >                      Register Generated Credits
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/app/wallet')}
                    >
                      View Wallet
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <>
          {/* Features Section */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="primary">
                    Secure Trading
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Trade carbon credits securely using blockchain technology. All transactions are transparent and immutable, ensuring trust and accountability in every trade.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="primary">
                    Real-time Market
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Access real-time market data and trade carbon credits at competitive prices. Our platform provides up-to-the-minute pricing and market insights.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom color="primary">
                    Easy Integration
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Connect your wallet and start trading in minutes. We support MetaMask and other popular wallets, making it easy to get started with blockchain trading.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Benefits Section */}
          <Box sx={{ bgcolor: 'background.paper', py: 6, borderRadius: 2 }}>
            <Container>
              <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
                Why Choose Our Platform?
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      🌱 Environmental Impact
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Make a real difference in the fight against climate change by participating in the carbon credits market.
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      💰 Competitive Pricing
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Get the best prices for your carbon credits with our transparent and efficient marketplace.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      🔒 Secure Transactions
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      All trades are secured by blockchain technology, ensuring transparency and immutability.
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      📊 Market Insights
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Access detailed market analytics and insights to make informed trading decisions.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard; 