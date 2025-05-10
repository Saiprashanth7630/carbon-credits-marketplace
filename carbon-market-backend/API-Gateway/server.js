require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

console.log('Starting API Gateway...');
console.log('Environment variables:', {
    PORT: process.env.PORT,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    GANACHE_URL: process.env.GANACHE_URL
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Ganache
console.log('Connecting to Ganache...');
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');

// Load contract ABI and address
const contractPath = path.join(__dirname, 'abi/CarbonCreditsMarketplaceABI.json');
console.log('Loading contract from:', contractPath);

try {
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract ABI file not found at ${contractPath}`);
    }

    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const contractABI = contractJson.abi;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS not found in environment variables');
    }

    console.log('Contract Address:', contractAddress);
    console.log('Contract ABI loaded successfully');

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    console.log('Contract instance created successfully');

    // Test connection to contract
    contract.pricePerCarbonCredit().then(price => {
        console.log('Successfully connected to contract. Current price:', price.toString());
    }).catch(error => {
        console.error('Error connecting to contract:', error);
    });

    // Routes
    app.get('/api/price', async (req, res) => {
        console.log('Received request for /api/price');
        try {
            console.log('Fetching price...');
            const price = await contract.pricePerCarbonCredit();
            console.log('Price:', price.toString());
            res.json({ price: price.toString() });
        } catch (error) {
            console.error('Error fetching price:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/purchase', async (req, res) => {
        try {
            const { amount, walletAddress, privateKey } = req.body;
            
            // Create wallet instance
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = contract.connect(wallet);

            // Get price per credit
            const pricePerCredit = await contract.pricePerCarbonCredit();
            const totalPrice = pricePerCredit * BigInt(amount);

            // Send transaction
            const tx = await contractWithSigner.purchaseCarbonCredits(amount, {
                value: totalPrice
            });
            
            await tx.wait();

            res.json({ 
                success: true, 
                transactionHash: tx.hash 
            });
        } catch (error) {
            console.error('Error purchasing credits:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post('/api/transfer', async (req, res) => {
        try {
            const { recipient, amount, privateKey } = req.body;
            
            // Create wallet instance
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = contract.connect(wallet);

            // Send transaction
            const tx = await contractWithSigner.transferCarbonCredits(recipient, amount);
            await tx.wait();

            res.json({ 
                success: true, 
                transactionHash: tx.hash 
            });
        } catch (error) {
            console.error('Error transferring credits:', error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get('/api/balance/:address', async (req, res) => {
        try {
            const { address } = req.params;
            const balance = await contract.carbonCredits(address);
            res.json({ balance: balance.toString() });
        } catch (error) {
            console.error('Error fetching balance:', error);
            res.status(500).json({ error: error.message });
        }
    });

} catch (error) {
    console.error('Error initializing contract:', error);
    process.exit(1); // Exit if we can't initialize the contract
}

// Start server
app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});