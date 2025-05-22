const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(100);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Get transactions for a specific wallet
router.get('/wallet/:walletAddress', auth, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const transactions = await Transaction.find({
      userId: req.user._id,
      walletAddress: walletAddress.toLowerCase()
    })
      .sort({ date: -1 })
      .limit(100);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Error fetching wallet transactions' });
  }
});

// Add a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { walletAddress, type, amount, description, transactionHash } = req.body;

    // If a transaction hash is provided, check for duplicates
    if (transactionHash) {
      const existingTransaction = await Transaction.findOne({
        walletAddress: walletAddress.toLowerCase(),
        transactionHash,
        userId: req.user._id
      });

      if (existingTransaction) {
        // Transaction already exists, return it without creating a duplicate
        return res.status(200).json({
          transaction: existingTransaction,
          message: 'Transaction already recorded'
        });
      }
    }

    // Create a new transaction
    const transaction = new Transaction({
      userId: req.user._id,
      walletAddress: walletAddress.toLowerCase(),
      type,
      amount: parseFloat(amount),
      description,
      transactionHash,
      date: Date.now()
    });

    await transaction.save();
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Error adding transaction:', error);
    
    // Better error handling for unique constraint violations
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate transaction detected' });
    }
    
    res.status(500).json({ message: 'Error adding transaction' });
  }
});

module.exports = router; 