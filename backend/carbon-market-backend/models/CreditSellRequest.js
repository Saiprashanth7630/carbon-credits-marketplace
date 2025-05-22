const mongoose = require('mongoose');

const creditSellRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  description: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  transactionHash: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'user-submission',
    enum: ['user-submission', 'blockchain-audit', 'admin-registration']
  },
  documents: {
    type: [String], // Array of document file paths
    default: []
  }
}, {
  timestamps: true
});

// Indexes for faster queries
creditSellRequestSchema.index({ userId: 1, status: 1 });
creditSellRequestSchema.index({ walletAddress: 1, status: 1 });
creditSellRequestSchema.index({ status: 1, submittedDate: -1 });

// Virtual field to get the age of the request
creditSellRequestSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.submittedDate) / (1000 * 60 * 60 * 24)); // age in days
});

// Check if the model already exists to avoid OverwriteModelError
const CreditSellRequest = mongoose.models.CreditSellRequest || mongoose.model('CreditSellRequest', creditSellRequestSchema);

module.exports = CreditSellRequest; 