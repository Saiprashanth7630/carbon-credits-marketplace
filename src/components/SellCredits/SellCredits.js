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
import { Sell } from '@mui/icons-material';
import { ethers } from 'ethers';
import { blockchainService } from '../services/blockchainService';  // Assuming this service is set up correctly

const SellCredits = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [availableCredits, setAvailableCredits] = useState(0);
    const [recipientAddress, setRecipientAddress] = useState('');

    useEffect(() => {
        fetchAvailableCredits();
    }, []);

    const fetchAvailableCredits = async () => {
        try {
            const userWallet = await blockchainService.getUserWallet();  // Get user wallet address

            if (!userWallet) {
                setError('Please connect your wallet');
                return;
            }

            const credits = await blockchainService.getCredits(userWallet);  // Fetch available credits directly from blockchain
            setAvailableCredits(credits);
        } catch (err) {
            setError('Failed to fetch available credits');
        }
    };

    const handleSell = async () => {
        if (!amount || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount > availableCredits) {
            setError('You cannot sell more credits than you own');
            return;
        }

        if (!recipientAddress) {
            setError('Please enter a recipient address');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const userWallet = await blockchainService.getUserWallet();

            if (!userWallet) {
                setError('Please connect your wallet');
                setLoading(false);
                return;
            }

            const totalAmountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');

            const tx = await blockchainService.transferCredits(userWallet, recipientAddress, totalAmountInWei);

            // Wait for the transaction to be mined
            await tx.wait();

            setSuccess('Successfully transferred carbon credits!');
            setAmount('');
            setRecipientAddress('');
            fetchAvailableCredits();  // Refresh available credits after transfer
        } catch (err) {
            setError(err.message || 'Failed to process the transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Transfer Carbon Credits
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 1 }} align="center" color="text.secondary">
                    Transfer your carbon credits to another address.
                </Typography>

                <Typography variant="subtitle1" sx={{ mb: 3 }} align="center">
                    Available Credits: {availableCredits}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Successfully transferred carbon credits!
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Recipient Address"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        fullWidth
                        placeholder="0x..."
                    />

                    <TextField
                        label="Number of Credits to Transfer"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 1, max: availableCredits }
                        }}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Sell />}
                        onClick={handleSell}
                        disabled={loading || !amount || amount > availableCredits || !recipientAddress}
                    >
                        {loading ? 'Processing...' : 'Transfer Credits'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default SellCredits;
