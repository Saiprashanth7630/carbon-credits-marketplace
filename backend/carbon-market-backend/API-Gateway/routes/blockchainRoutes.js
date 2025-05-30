const express = require('express');
const { ethers } = require('ethers');
const contractABI = require('../abi/CarbonCreditsMarketplaceABI.json');

const router = express.Router();

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
const wallet = new ethers.Wallet('0x6af70d37e07002f2497c4292f4b258d2403a784794476e086e624ee5273d3c46', provider);
const contract = new ethers.Contract('0x64B77D9DF76cB3e11dEc85856417790195F72802', contractABI, wallet);

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
router.get('/balance/:address', async (req, res) => {
    try {
        const balance = await contract.balanceOf(req.params.address);
        res.json({ balance: ethers.formatEther(balance) });
    } catch (error) {
        console.error("Balance Error:", error);
        res.status(500).json({ error: "Error retrieving balance" });
    }
});

// Transfer tokens
router.post('/transfer', async (req, res) => {
    try {
        const { to, amount } = req.body;
        const tx = await contract.transfer(to, ethers.parseEther(amount));
        await tx.wait();
        res.json({ message: "Transfer successful", transactionHash: tx.hash });
    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ error: "Error transferring tokens" });
    }
});

// Approve allowance
router.post('/approve', async (req, res) => {
    try {
        const { spender, amount } = req.body;
        const tx = await contract.approve(spender, ethers.parseEther(amount));
        await tx.wait();
        res.json({ message: "Approval successful", transactionHash: tx.hash });
    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ error: "Error approving allowance" });
    }
});

// Purchase carbon credits (matches your buy-credits component)
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

// Transfer carbon credits (matches your sell-credits component)
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

// Get carbon credits balance (matches your components)
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