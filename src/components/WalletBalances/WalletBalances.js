import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { AccountBalance, Visibility, VisibilityOff, CreditCard, AccountBalanceWallet } from '@mui/icons-material';
import { ethers } from 'ethers';
import { 
    getCredits, 
    getWalletAddress, 
    connectWithPrivateKey,
    getEthBalance
} from '../../services/blockchainService';

const WalletBalances = () => {
    const [privateKey, setPrivateKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [carbonCredits, setCarbonCredits] = useState(null);
    const [ethBalance, setEthBalance] = useState(null);
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    const handlePrivateKeyChange = (e) => {
        setPrivateKey(e.target.value);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!privateKey || privateKey.length < 64) {
            setError('Please enter a valid private key');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Connect with private key and get wallet address
            const signer = await connectWithPrivateKey(privateKey);
            const address = await signer.getAddress();
            setWalletAddress(address);

            // Get carbon credits
            const credits = await getCredits(address);
            setCarbonCredits(parseFloat(credits));

            // Get ETH balance
            // First, check if we need to add getEthBalance to the blockchain service
            if (typeof getEthBalance === 'function') {
                const ethBal = await getEthBalance(address);
                setEthBalance(ethBal);
            } else {
                // Implement a direct way to get ETH balance if the function isn't available
                const provider = signer.provider;
                const balanceWei = await provider.getBalance(address);
                const formattedBalance = parseFloat(ethers.formatEther(balanceWei));
                setEthBalance(formattedBalance);
            }
        } catch (err) {
            console.error("Error fetching wallet data:", err);
            setError(err.message || 'Failed to fetch wallet data');
            setCarbonCredits(null);
            setEthBalance(null);
            setWalletAddress('');
        } finally {
            setLoading(false);
        }
    };

    const toggleShowPrivateKey = () => {
        setShowPrivateKey(!showPrivateKey);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Wallet Balances
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3 }} align="center" color="text.secondary">
                    Enter your private key to view your wallet balances.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    <TextField
                        label="Private Key"
                        value={privateKey}
                        onChange={handlePrivateKeyChange}
                        fullWidth
                        margin="normal"
                        type={showPrivateKey ? 'text' : 'password'}
                        placeholder="Enter your wallet private key"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle private key visibility"
                                        onClick={toggleShowPrivateKey}
                                        edge="end"
                                    >
                                        {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        error={Boolean(error && error.includes('private key'))}
                        disabled={loading}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || !privateKey}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWallet />}
                    >
                        {loading ? 'Loading...' : 'View Balances'}
                    </Button>
                </Box>

                {walletAddress && (
                    <>
                        <Divider sx={{ mb: 3 }} />
                        
                        <Typography variant="h6" gutterBottom>
                            Wallet Address: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                        </Typography>
                        
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <Card raised>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="h6">Carbon Credits</Typography>
                                        </Box>
                                        <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', my: 3 }}>
                                            {carbonCredits !== null ? carbonCredits.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                                <Card raised>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="h6">ETH Balance</Typography>
                                        </Box>
                                        <Typography variant="h3" align="center" sx={{ fontWeight: 'bold', my: 3 }}>
                                            {ethBalance !== null ? ethBalance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'} ETH
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default WalletBalances; 