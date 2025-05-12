const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Buyer', 'Seller', 'Admin']
    },
    location: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        unique: true,
        sparse: true
    },
    creditType: {
        type: String,
        enum: ['renewable-energy', 'forestry', 'agriculture', 'industrial'],
        required: true
    },
    transactions: [{
        type: {
            type: String,
            enum: ['purchase', 'sale', 'transfer'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        transactionHash: {
            type: String,
            required: true
        },
        counterparty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 