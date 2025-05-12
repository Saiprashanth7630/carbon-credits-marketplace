import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { ethers } from 'ethers';
import { blockchainService } from '../services/blockchainService';  // Assuming this service is set up correctly

const BuyCredits = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [pricePerCredit, setPricePerCredit] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        fetchCreditPrice();
    }, []);

    useEffect(() => {
        if (amount && pricePerCredit) {
            const total = amount * pricePerCredit;
            setTotalPrice(total);
        } else {
            setTotalPrice(0);
        }
    }, [amount, pricePerCredit]);

    const fetchCreditPrice = async () => {
        try {
            // Assuming this gets the price from your backend or smart contract directly
            const response = await blockchainService.getCreditPrice();  
            setPricePerCredit(response.price);
        } catch (err) {
            setError('Failed to fetch credit price');
        }
    };

    const handleBuy = async () => {
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Assuming blockchainService.purchaseCredits handles blockchain interaction
            const userWallet = await blockchainService.getUserWallet(); // This should return the wallet address or prompt to connect wallet (via MetaMask)

            if (!userWallet) {
                setError('Please connect your wallet');
                setLoading(false);
                return;
            }

            const totalAmountInWei = ethers.utils.parseUnits(totalPrice.toString(), 'ether');

            const tx = await blockchainService.purchaseCredits(userWallet, amount, totalAmountInWei);  // Blockchain function to purchase

            // Wait for the transaction to be mined
            await tx.wait();

            setSuccess('Successfully purchased carbon credits!');
            setAmount('');
            fetchCreditPrice();  // Refresh price after purchase
        } catch (err) {
            setError(err.message || 'Failed to process the purchase');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Buy Carbon Credits
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3 }} align="center" color="text.secondary">
                    Purchase carbon credits to offset your carbon footprint and support environmental projects.
                </Typography>

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

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Number of Credits"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 1 }
                        }}
                    />

                    {amount > 0 && (
                        <Typography variant="body1" align="center" color="text.secondary">
                            Total Cost: {totalPrice} ETH
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCart />}
                        onClick={handleBuy}
                        disabled={loading || !amount}
                    >
                        {loading ? 'Processing...' : 'Buy Credits'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default BuyCredits;
