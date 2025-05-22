const express = require('express');
const router = express.Router();
const CreditSellRequest = require('../models/CreditSellRequest');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const upload = require('../middleware/fileUpload');

// Get sell requests for the authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    const sellRequests = await CreditSellRequest.find({ userId: req.userId })
      .sort({ submittedDate: -1 });
    
    res.json({ sellRequests });
  } catch (error) {
    console.error('Error fetching sell requests:', error);
    res.status(500).json({ message: 'Error fetching sell requests' });
  }
});

// Submit a new sell request
router.post('/submit', auth, async (req, res) => {
  try {
    console.log('==== CREDIT REGISTRATION REQUEST ====');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User ID from auth:', req.userId);
    console.log('User from auth:', req.user);
    
    const { walletAddress, amount, description } = req.body;
    // Use default price of 0.25 ETH
    const defaultPrice = 0.25;

    console.log('Request received:', req.body);

    // Validate required fields
    if (!walletAddress) {
      console.log('Missing wallet address');
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    if (!amount) {
      console.log('Missing amount');
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    if (!req.userId) {
      console.log('Missing userId from auth middleware');
      return res.status(400).json({ message: 'User authentication failed. Please log in again.' });
    }

    // Check if there's a pending request for the same wallet and amount
    const existingRequest = await CreditSellRequest.findOne({
      userId: req.userId,
      walletAddress: walletAddress.toLowerCase(),
      amount: parseFloat(amount),
      status: 'pending'
    });

    if (existingRequest) {
      console.log('Existing request found:', existingRequest);
      return res.status(400).json({
        message: 'You already have a pending sell request for this amount',
        existingRequest
      });
    }

    // Create a new sell request (without documents for now)
    const sellRequest = new CreditSellRequest({
      userId: req.userId,
      walletAddress: walletAddress.toLowerCase(),
      amount: parseFloat(amount),
      price: defaultPrice,
      description: description || '',
      submittedDate: Date.now(),
      status: 'pending'
    });

    console.log('Attempting to save sell request:', sellRequest);
    await sellRequest.save();
    console.log('Sell request saved successfully');
    
    res.status(201).json({ 
      message: 'Credit registration submitted successfully', 
      sellRequest 
    });
  } catch (error) {
    console.error('Error submitting sell request:', error);
    res.status(500).json({ message: 'Error submitting sell request: ' + error.message });
  }
});

// Cancel a sell request (user can only cancel their own pending requests)
router.delete('/:id', auth, async (req, res) => {
  try {
    const sellRequest = await CreditSellRequest.findOne({
      _id: req.params.id,
      userId: req.userId,
      status: 'pending'
    });

    if (!sellRequest) {
      return res.status(404).json({ message: 'Sell request not found or cannot be canceled' });
    }

    // Set status to 'rejected' instead of deleting
    sellRequest.status = 'rejected';
    sellRequest.adminNotes = 'Canceled by user';
    await sellRequest.save();

    res.json({ message: 'Sell request canceled successfully' });
  } catch (error) {
    console.error('Error canceling sell request:', error);
    res.status(500).json({ message: 'Error canceling sell request' });
  }
});

// ADMIN ROUTES

// Get all sell requests (admin only)
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const sellRequests = await CreditSellRequest.find(query)
      .sort({ submittedDate: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'fullName email username')
      .populate('reviewedBy', 'fullName email username');
    
    res.json({ sellRequests });
  } catch (error) {
    console.error('Error fetching all sell requests:', error);
    res.status(500).json({ message: 'Error fetching sell requests' });
  }
});

// Get pending sell requests (admin only)
router.get('/admin/pending', auth, isAdmin, async (req, res) => {
  try {
    const sellRequests = await CreditSellRequest.find({ status: 'pending' })
      .sort({ submittedDate: 1 }) // Oldest first
      .populate('userId', 'fullName email username');
    
    res.json({ sellRequests });
  } catch (error) {
    console.error('Error fetching pending sell requests:', error);
    res.status(500).json({ message: 'Error fetching pending sell requests' });
  }
});

// Review a sell request (admin only)
router.put('/admin/review/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved or rejected) is required' });
    }

    const sellRequest = await CreditSellRequest.findById(req.params.id);
    if (!sellRequest) {
      return res.status(404).json({ message: 'Sell request not found' });
    }

    if (sellRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot review a sell request that is ${sellRequest.status}` 
      });
    }

    // Update the sell request
    sellRequest.status = status;
    sellRequest.adminNotes = adminNotes || '';
    sellRequest.reviewedBy = req.userId;
    sellRequest.reviewDate = Date.now();
    await sellRequest.save();

    // If approved, create a 'sell' transaction
    if (status === 'approved') {
      // Create a transaction record to track this approval
      const transaction = new Transaction({
        userId: sellRequest.userId,
        walletAddress: sellRequest.walletAddress,
        type: 'sell',
        amount: sellRequest.amount,
        ethAmount: sellRequest.amount * sellRequest.price,
        description: `Sell request approved: ${sellRequest.amount} credits at ${sellRequest.price} ETH each`,
        date: Date.now(),
        status: 'completed'
      });
      
      await transaction.save();
    }

    res.json({ 
      message: `Sell request ${status}`, 
      sellRequest
    });
  } catch (error) {
    console.error('Error reviewing sell request:', error);
    res.status(500).json({ message: 'Error reviewing sell request' });
  }
});

// Get sell request statistics (admin only)
router.get('/admin/stats', auth, isAdmin, async (req, res) => {
  try {
    const stats = {
      pending: await CreditSellRequest.countDocuments({ status: 'pending' }),
      approved: await CreditSellRequest.countDocuments({ status: 'approved' }),
      rejected: await CreditSellRequest.countDocuments({ status: 'rejected' }),
      completed: await CreditSellRequest.countDocuments({ status: 'completed' }),
      total: await CreditSellRequest.countDocuments()
    };
    
    // Calculate total credits in pending requests
    const pendingRequests = await CreditSellRequest.find({ status: 'pending' });
    stats.pendingCredits = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
    
    // Calculate total credits in approved but not completed
    const approvedRequests = await CreditSellRequest.find({ status: 'approved' });
    stats.approvedCredits = approvedRequests.reduce((sum, req) => sum + req.amount, 0);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching sell request statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get available credits for purchase (public endpoint)
router.get('/available', async (req, res) => {
  try {
    const approvedRequests = await CreditSellRequest.find({ 
      status: 'approved',
      amount: { $gt: 0 }  // Only get requests with remaining credits
    })
    .populate('userId', 'fullName email')
    .sort({ submittedDate: -1 });

    const totalAvailable = approvedRequests.reduce((sum, req) => sum + req.amount, 0);
    
    res.json({ 
      approvedRequests,
      totalAvailable
    });
  } catch (error) {
    console.error('Error fetching available credits:', error);
    res.status(500).json({ message: 'Error fetching available credits' });
  }
});

module.exports = router; 