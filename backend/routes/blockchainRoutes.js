const express = require('express');
const { ethers } = require('ethers');
const contractABI = require('../contracts/CarbonCreditsMarketplaceABI.json');
const config = require('../config');

const router = express.Router();

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(config.ganacheUrl);
const wallet = new ethers.Wallet(config.contractOwnerPrivateKey, provider);
const contract = new ethers.Contract(config.contractAddress, contractABI, wallet);

// Get current price of carbon credits
router.get('/price', async (req, res) => {
    try {
        const price = await contract.pricePerCarbonCredit();
        res.json({ price: ethers.formatEther(price) });
    } catch (error) {
        console.error("Price Error:", error);
        res.status(500).json({ error: "Error retrieving price of carbon credits" });
    }
});

// Get balance of an address
router.get('/balance', async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const credits = await contract.carbonCredits(address);
        res.json({ 
            balance: ethers.formatUnits(credits, 'ether')
        });
    } catch (error) {
        console.error("Balance Error:", error);
        res.status(500).json({ 
            error: "Retrieval failed",
            details: error.message
        });
    }
});

// Purchase carbon credits
router.post('/purchase', async (req, res) => {
    try {
        const { amount } = req.body;
        const price = await contract.pricePerCarbonCredit();
        const totalPrice = price * BigInt(amount);

        const tx = await contract.purchaseCarbonCredits(amount, {
            value: totalPrice,
        });
        await tx.wait();

        res.json({ 
            message: "Carbon Credits Purchased", 
            transactionHash: tx.hash,
            credits: amount
        });
    } catch (error) {
        console.error("Purchase Error:", error);
        res.status(500).json({ 
            error: error.reason || "Purchase failed",
            details: error.message 
        });
    }
});

// Transfer carbon credits
router.post('/transfer', async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const amountInWei = ethers.parseUnits(amount.toString(), 'ether');
        
        const tx = await contract.transferCarbonCredits(recipient, amountInWei);
        await tx.wait();

        res.json({ 
            message: "Transfer successful", 
            transactionHash: tx.hash,
            recipient,
            amount
        });
    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ 
            error: error.reason || "Transfer failed",
            details: error.message
        });
    }
});

// Admin-only endpoints
router.post('/update-price', async (req, res) => {
    try {
        const { newPrice } = req.body;
        const priceInWei = ethers.parseEther(newPrice.toString());
        
        const tx = await contract.updatePrice(priceInWei);
        await tx.wait();
        
        res.json({ 
            message: "Price Updated", 
            transactionHash: tx.hash,
            newPrice
        });
    } catch (error) {
        console.error("Price Update Error:", error);
        res.status(500).json({ 
            error: "Update failed",
            details: error.message
        });
    }
});

// Withdraw funds from contract (admin-only)
router.post('/withdraw', async (req, res) => {
    try {
        const tx = await contract.withdraw();
        await tx.wait();
        res.json({ 
            message: "Withdrawal successful", 
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error("Withdrawal Error:", error);
        res.status(500).json({ 
            error: "Withdraw failed",
            details: error.message
        });
    }
});

module.exports = router; 