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
        enum: ['admin', 'Buyer', 'Seller'],
        default: 'Buyer'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_users',
            'manage_credits',
            'manage_prices',
            'withdraw_funds',
            'view_analytics',
            'manage_listings'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    auth: {
        token: String,
        lastLogin: {
            type: Date
        }
    },
    adminMetadata: {
        walletAddress: String,
        isContractOwner: {
            type: Boolean,
            default: false
        },
        accessLevel: {
            type: String,
            enum: ['super_admin', 'admin', 'moderator'],
            default: 'admin'
        }
    },
    location: {
        type: String,
        required: true
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

// Add method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Add method to check specific permission
userSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Add method to check if user can access admin portal
userSchema.methods.canAccessAdminPortal = function() {
    return this.isAdmin() && this.isActive;
};

// Check if the model already exists to avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User; 