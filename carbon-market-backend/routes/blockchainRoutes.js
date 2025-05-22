const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Web3 } = require('web3');
const { CarbonCreditsContract } = require('../contracts/CarbonCreditsContract');
const CreditSellRequest = require('../models/CreditSellRequest');
const Transaction = require('../models/Transaction');
const ethers = require('ethers');

// Initialize Web3 with proper provider configuration
const web3 = new Web3(process.env.GANACHE_URL || 'http://localhost:7545');
// web3.eth.defaultAccount = web3.eth.accounts[0]; // We will use the wallet address from the request instead
web3.eth.handleRevert = true; // Enable revert handling

// Initialize contract
const contract = new CarbonCreditsContract(web3);

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        const balance = await contract.getBalance(address);
        res.json({ balance: balance.toString() });
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        res.status(500).json({ message: 'Error getting wallet balance' });
    }
});

// Get recent transactions for a wallet
router.get('/recent', auth, async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Get transactions from the last 24 hours
        const fromBlock = await web3.eth.getBlockNumber() - 1000; // Approximate 24 hours
        const events = await contract.getTransferEvents(address, fromBlock);
        
        // Process events asynchronously
        const transactions = await Promise.all(events.map(async event => {
            const block = await web3.eth.getBlock(event.blockNumber);
            return {
                type: event.returnValues.from.toLowerCase() === address.toLowerCase() ? 'transfer-out' : 'transfer-in',
                amount: web3.utils.fromWei(event.returnValues.value, 'ether'),
                timestamp: block.timestamp * 1000,
                from: event.returnValues.from,
                to: event.returnValues.to,
                transactionHash: event.transactionHash
            };
        }));

        res.json({ transactions });
    } catch (error) {
        console.error('Error getting recent transactions:', error);
        res.status(500).json({ message: 'Error getting recent transactions' });
    }
});

// Update to only allow purchasing approved credits
router.post('/purchase', auth, async (req, res) => {
    try {
        console.log('Purchase request received:', req.body);
        const { amount, walletAddress } = req.body; // Destructure walletAddress from body
        
        // Use walletAddress from request body if available, otherwise use from user profile
        const userWalletAddress = walletAddress || req.user.adminMetadata.walletAddress;
        console.log('Using wallet address:', userWalletAddress);

        if (!userWalletAddress) {
            return res.status(400).json({ error: 'User wallet address not found in request or profile.' });
        }
        
        // Check if there are enough approved credits available for sale
        const approvedRequests = await CreditSellRequest.find({ status: 'approved' });
        console.log('Approved requests:', approvedRequests);
        const totalApprovedCredits = approvedRequests.reduce((sum, req) => sum + req.amount, 0);
        console.log('Total approved credits:', totalApprovedCredits);
        
        if (totalApprovedCredits < amount) {
            return res.status(400).json({ 
                error: 'Not enough credits available for purchase',
                available: totalApprovedCredits,
                requested: amount
            });
        }

        // Get current price from the smart contract
        console.log('Getting price from contract...');
        const price = await contract.getPrice();
        console.log('Price from contract:', price);
        // Convert price and amount to BigInt for calculation
        const totalPrice = BigInt(price) * BigInt(amount);
        console.log('Total price (BigInt):', totalPrice.toString());

        // Get the contract instance
        console.log('Getting contract instance...');
        const contractInstance = contract.contract;
        console.log('Contract instance:', contractInstance);
        
        // Prepare the transaction data
        console.log('Preparing transaction data...');
        const amountBigInt = BigInt(amount);
        const data = contractInstance.methods.purchaseCarbonCredits(amountBigInt).encodeABI();
        console.log('Transaction data:', data);
        
        // Get the current gas price
        console.log('Getting gas price...');
        const gasPrice = await web3.eth.getGasPrice();
        console.log('Gas price:', gasPrice);
        
        // Estimate gas for the transaction
        console.log('Estimating gas...');
        const gas = await contractInstance.methods.purchaseCarbonCredits(amountBigInt)
            .estimateGas({ from: userWalletAddress, value: totalPrice.toString() });
        console.log('Estimated gas:', gas);

        // Create the transaction object
        const txObject = {
            from: userWalletAddress,
            to: contract.contractAddress,
            value: totalPrice.toString(),
            gas: (gas + BigInt(Math.floor(Number(gas) * 0.2))).toString(), // Use estimated gas with 20% buffer, convert to string
            gasPrice: gasPrice.toString(), // Convert gasPrice to string
            data: data
        };
        console.log('Transaction object:', txObject);

        // Send the transaction
        console.log('Sending transaction...');
        // NOTE: In a real application, sending a transaction from the backend
        // using the user's wallet address this way would require the backend
        // to have access to the user's private key, which is highly insecure.
        // A more secure approach would involve the frontend prompting the user
        // to sign and send the transaction via MetaMask, and then sending the
        // transaction hash to the backend to record the purchase and update
        // sell request statuses.
        const tx = await web3.eth.sendTransaction(txObject);
        console.log('Transaction sent:', tx);
        
        // Mark sell requests as completed
        let remainingAmount = amount;
        for (const request of approvedRequests) {
            if (remainingAmount <= 0) break;
            
            const requestAmount = Math.min(remainingAmount, request.amount);
            remainingAmount -= requestAmount;
            
            if (requestAmount === request.amount) {
                // If using the entire request
                request.status = 'completed';
                request.completedDate = Date.now();
                await request.save();
            } else {
                // If using part of the request, update the remaining amount
                request.amount -= requestAmount;
                await request.save();
                
                // Create a new completed request for the purchased portion
                const completedRequest = new CreditSellRequest({
                    userId: request.userId,
                    walletAddress: request.walletAddress,
                    amount: requestAmount,
                    price: request.price,
                    status: 'completed',
                    submittedDate: request.submittedDate,
                    reviewedBy: request.reviewedBy,
                    reviewDate: request.reviewDate,
                    adminNotes: request.adminNotes,
                    completedDate: Date.now()
                });
                await completedRequest.save();
            }
            
            // Create a transaction record for the seller
            const transaction = new Transaction({
                userId: request.userId,
                walletAddress: request.walletAddress,
                type: 'sell',
                amount: requestAmount,
                ethAmount: requestAmount * request.price,
                description: `Credits sold: ${requestAmount} at ${request.price} ETH each`,
                date: Date.now(),
                status: 'completed',
                transactionHash: tx.transactionHash
            });
            await transaction.save();
        }
        
        // Create a transaction record for the buyer
        const transaction = new Transaction({
            userId: req.userId,
            walletAddress: userWalletAddress, // Use the wallet address from the request/metamask
            type: 'buy',
            amount: amount,
            description: `Credits purchased: ${amount}`,
            date: Date.now(),
            status: 'completed',
            transactionHash: tx.transactionHash
        });
        await transaction.save();

        res.json({ 
            message: "Carbon Credits Purchased", 
            transactionHash: tx.transactionHash,
            credits: amount
        });
    } catch (error) {
        console.error("Purchase Error Details:", {
            message: error.message,
            reason: error.reason,
            stack: error.stack,
            data: error.data,
            errorObject: error
        });
        res.status(500).json({
            error: error.reason || "Purchase failed",
            details: error.message,
            stack: error.stack,
            // Consider adding more specific error details here for the frontend if needed
            // data: error.data,
            // code: error.code
        });
    }
});

module.exports = router; 