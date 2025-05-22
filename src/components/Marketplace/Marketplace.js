import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import config from '../../config';
import CarbonCreditsMarketplaceABI from '../../services/CarbonCreditsMarketplaceABI.json';
import { useMetaMask } from '../../hooks/useMetaMask';

const Marketplace = () => {
  const { connect, isConnected, account, provider, error: metaMaskError } = useMetaMask();
  const [listings, setListings] = useState([]);
  const [buyRequests, setBuyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [newListingAmount, setNewListingAmount] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newBuyRequestAmount, setNewBuyRequestAmount] = useState('');
  const [newBuyRequestMaxPrice, setNewBuyRequestMaxPrice] = useState('');
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [carbonTokenContract, setCarbonTokenContract] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [pricePerCredit, setPricePerCredit] = useState('0');

  useEffect(() => {
    if (metaMaskError) {
      setError(metaMaskError);
      setShowError(true);
    }
  }, [metaMaskError]);

  const initializeContracts = async () => {
    try {
      if (!provider || !account) {
        console.log('Provider or account not available yet');
        return;
      }

      setLoading(true);
      console.log('Initializing contracts...');
      
      // Get the signer from the provider
      const signer = provider.getSigner();
      console.log('Signer address:', account);

      // Initialize contracts
      console.log('Initializing marketplace contract at:', config.contractAddress);
      const marketplaceContract = new ethers.Contract(
        config.contractAddress,
        CarbonCreditsMarketplaceABI,
        signer
      );
      
      // Test contract connection
      try {
        const listingCount = await marketplaceContract.listingCount();
        console.log('Contract connection successful. Listing count:', listingCount.toString());
      } catch (err) {
        console.error('Contract connection test failed:', err);
        throw new Error('Failed to connect to contract: ' + err.message);
      }
      
      setMarketplaceContract(marketplaceContract);
      setCarbonTokenContract(marketplaceContract);

      // Get user's carbon credit balance
      const balance = await marketplaceContract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      setUserBalance(formattedBalance);
      console.log('User balance:', formattedBalance);

      // Get price per credit from contract
      const price = await marketplaceContract.pricePerCarbonCredit();
      const formattedPrice = ethers.utils.formatEther(price);
      setPricePerCredit(formattedPrice);
      console.log('Price per credit:', formattedPrice);

      // Load initial data
      console.log('Loading initial data...');
      await loadListings();
      await loadBuyRequests();
      
      console.log('Contract initialization complete');
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setError('Failed to initialize contracts: ' + error.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && provider && account) {
      initializeContracts();
    }
  }, [isConnected, provider, account]);

  const loadListings = async () => {
    try {
      if (!marketplaceContract || !provider || !account) {
        console.log('Contracts or provider not initialized yet');
        return;
      }

      setLoading(true);
      console.log('Loading listings...');
      
      // Get the signer from the provider
      const signer = provider.getSigner();
      
      // Get total number of listings
      const listingCount = await marketplaceContract.listingCount();
      console.log('Total listings:', listingCount.toString());

      // Load all listings
      const listings = [];
      for (let i = 1; i <= listingCount; i++) {
        try {
          const listing = await marketplaceContract.listings(i);
          if (listing.seller !== ethers.constants.AddressZero) {
            const formattedListing = {
              id: i,
              seller: listing.seller,
              amount: ethers.utils.formatUnits(listing.amount, 18),
              price: ethers.utils.formatEther(listing.price),
              isActive: listing.isActive,
              timestamp: new Date(listing.timestamp.toNumber() * 1000).toLocaleString()
            };
            listings.push(formattedListing);
          }
        } catch (err) {
          console.error(`Error loading listing ${i}:`, err);
        }
      }

      console.log('Loaded listings:', listings);
      setListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setError('Failed to load listings: ' + error.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyRequests = async () => {
    try {
      if (!marketplaceContract) {
        console.log('Contract not initialized yet, skipping buy requests load');
        return;
      }

      console.log('Loading buy requests from contract:', marketplaceContract.address);
      
      // Try to get the buy request count first
      const count = await marketplaceContract.buyRequestCount().catch(err => {
        console.error('Error getting buy request count:', err);
        return ethers.BigNumber.from(0); // Return 0 if function fails
      });

      console.log('Found', count.toString(), 'buy requests');
      
      const requestsArray = [];

      for (let i = 0; i < count; i++) {
        try {
          const request = await marketplaceContract.buyRequests(i);
          if (request.isActive) {
            requestsArray.push({
              id: i,
              buyer: request.buyer,
              amount: ethers.utils.formatUnits(request.amount, 18),
              maxPrice: ethers.utils.formatEther(request.maxPrice),
              isActive: request.isActive
            });
          }
        } catch (err) {
          console.error(`Error loading buy request ${i}:`, err);
          continue;
        }
      }

      setBuyRequests(requestsArray);
    } catch (err) {
      console.error('Error loading buy requests:', err);
      // Don't set error state, just log it
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      if (!marketplaceContract || !carbonTokenContract || !provider || !account) {
        throw new Error('Contracts or provider not initialized');
      }

      const amount = ethers.utils.parseUnits(newListingAmount, 18);
      const price = ethers.utils.parseEther(pricePerCredit).mul(amount);

      // Get the signer from the provider
      const signer = provider.getSigner();

      // Check if user has enough carbon credits
      const balance = await carbonTokenContract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      
      if (balance.isZero()) {
        throw new Error('You have no carbon credits. Please purchase credits from the admin first.');
      }
      
      if (balance.lt(amount)) {
        throw new Error(`Insufficient carbon credits. You have ${formattedBalance} credits, but trying to list ${newListingAmount} credits.`);
      }

      const gasPrice = ethers.utils.parseUnits("1", "gwei");
      const gasLimit = 500000;
      
      // First approve the marketplace contract to spend tokens
      const approveTx = await carbonTokenContract.approve(
        marketplaceContract.address,
        amount,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit
        }
      );
      await approveTx.wait();

      // Then create the listing
      const tx = await marketplaceContract.createListing(amount, price, {
        gasPrice: gasPrice,
        gasLimit: gasLimit
      });
      await tx.wait();

      setSuccess('Listing created successfully');
      setShowSuccess(true);
      setNewListingAmount('');
      await loadListings();
    } catch (err) {
      console.error('Error creating listing:', err);
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient ETH for gas. Please ensure your account has enough ETH to cover transaction costs.');
      } else {
        setError('Failed to create listing: ' + (err.message || 'Unknown error'));
      }
      setShowError(true);
    }
  };

  const handleFillListing = async (listingId, price) => {
    try {
      if (!marketplaceContract || !provider || !account) {
        throw new Error('Contract or provider not initialized');
      }

      setLoading(true);
      console.log('Filling listing:', listingId, 'Price:', price);

      // Get the signer from the provider
      const signer = provider.getSigner();

      // Verify the listing is still active
      const listing = await marketplaceContract.listings(listingId);
      if (!listing.isActive) {
        throw new Error('This listing is no longer active');
      }

      // Calculate the total price in wei
      const totalPrice = ethers.utils.parseEther(price.toString());
      console.log('Total price in wei:', totalPrice.toString());

      // Get user's ETH balance
      const ethBalance = await provider.getBalance(account);
      if (ethBalance.lt(totalPrice)) {
        throw new Error('Insufficient ETH balance to complete the purchase');
      }

      const gasPrice = ethers.utils.parseUnits("1", "gwei");
      const gasLimit = 500000;

      console.log('Sending transaction to fill listing...');
      const tx = await marketplaceContract.connect(signer).fillListing(listingId, {
        value: totalPrice,
        gasPrice: gasPrice,
        gasLimit: gasLimit
      });

      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for transaction confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      setSuccess('Purchase successful! Transaction hash: ' + tx.hash);
      setShowSuccess(true);
      
      // Refresh listings and user balance
      await Promise.all([
        loadListings(),
        initializeContracts()
      ]);
    } catch (err) {
      console.error('Error filling listing:', err);
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient ETH for gas. Please ensure your account has enough ETH to cover transaction costs.');
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        setError('Transaction would fail. The listing might have been filled or cancelled.');
      } else {
        setError('Failed to purchase credits: ' + (err.message || 'Unknown error'));
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBuyRequest = async (e) => {
    e.preventDefault();
    try {
      if (!marketplaceContract) {
        throw new Error('Contract not initialized');
      }

      const amount = ethers.utils.parseUnits(newBuyRequestAmount, 18);
      const maxPrice = ethers.utils.parseEther(newBuyRequestMaxPrice);

      const tx = await marketplaceContract.createBuyRequest(amount, maxPrice);
      await tx.wait();

      setSuccess('Buy request created successfully');
      setShowSuccess(true);
      setNewBuyRequestAmount('');
      setNewBuyRequestMaxPrice('');
      await loadBuyRequests();
    } catch (err) {
      console.error('Error creating buy request:', err);
      setError('Failed to create buy request');
      setShowError(true);
    }
  };

  const handleFillBuyRequest = async (requestId) => {
    try {
      if (!marketplaceContract) {
        throw new Error('Contract not initialized');
      }

      const tx = await marketplaceContract.fillBuyRequest(requestId);
      await tx.wait();

      setSuccess('Buy request filled successfully');
      setShowSuccess(true);
      await loadBuyRequests();
    } catch (err) {
      console.error('Error filling buy request:', err);
      setError('Failed to fill buy request');
      setShowError(true);
    }
  };

  if (!isConnected) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Connect to MetaMask
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please connect your MetaMask wallet to interact with the marketplace.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={connect}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Connect MetaMask'}
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Carbon Credits Marketplace
      </Typography>

      <Grid container spacing={3}>
        {/* Create Listing Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                List Your Credits
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Price: {pricePerCredit} ETH per credit
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Your Balance: {userBalance} credits
              </Typography>
              {parseFloat(userBalance) === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You have no carbon credits. Please purchase credits from the admin first.
                </Alert>
              )}
              <form onSubmit={handleCreateListing}>
                <TextField
                  fullWidth
                  label="Amount to List"
                  type="number"
                  value={newListingAmount}
                  onChange={(e) => setNewListingAmount(e.target.value)}
                  margin="normal"
                  required
                  disabled={parseFloat(userBalance) === 0}
                  helperText={`Total price will be ${newListingAmount ? (parseFloat(newListingAmount) * parseFloat(pricePerCredit)).toFixed(6) : '0'} ETH`}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={parseFloat(userBalance) === 0}
                  sx={{ mt: 2 }}
                >
                  Create Listing
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Create Buy Request Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Buy Request
              </Typography>
              <form onSubmit={handleCreateBuyRequest}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newBuyRequestAmount}
                  onChange={(e) => setNewBuyRequestAmount(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Max Price (ETH)"
                  type="number"
                  value={newBuyRequestMaxPrice}
                  onChange={(e) => setNewBuyRequestMaxPrice(e.target.value)}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create Buy Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Listings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Listings
              </Typography>
              {listings.length === 0 ? (
                <Typography>No active listings</Typography>
              ) : (
                <Grid container spacing={2}>
                  {listings.map((listing) => (
                    <Grid item xs={12} sm={6} md={4} key={listing.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography>Seller: {listing.seller}</Typography>
                          <Typography>Amount: {listing.amount} credits</Typography>
                          <Typography>Price: {listing.price} ETH</Typography>
                          <Typography>Timestamp: {listing.timestamp}</Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleFillListing(listing.id, listing.price)}
                            sx={{ mt: 1 }}
                          >
                            Buy
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active Buy Requests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Buy Requests
              </Typography>
              {buyRequests.length === 0 ? (
                <Typography>No active buy requests</Typography>
              ) : (
                <Grid container spacing={2}>
                  {buyRequests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography>Buyer: {request.buyer}</Typography>
                          <Typography>Amount: {request.amount} credits</Typography>
                          <Typography>Max Price: {request.maxPrice} ETH</Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleFillBuyRequest(request.id)}
                            sx={{ mt: 1 }}
                          >
                            Sell
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Marketplace; 