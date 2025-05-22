const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['buy', 'sell', 'transfer_in', 'transfer_out']
  },
  amount: {
    type: Number,
    required: true
  },
  ethAmount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  transactionHash: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ walletAddress: 1, date: -1 });

// Create a compound unique index to prevent duplicate transactions
transactionSchema.index({ transactionHash: 1, walletAddress: 1 }, { 
  unique: true,
  // Only create the unique index if transactionHash is not empty
  partialFilterExpression: { transactionHash: { $exists: true, $ne: '' } }
});

// Check if the model already exists to avoid OverwriteModelError
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 