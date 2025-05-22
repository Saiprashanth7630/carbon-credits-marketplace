const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../carbon-market-backend/models/User');
require('dotenv').config();

// MongoDB connection string from .env or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function makeAdmin() {
    try {
        // Default admin credentials
        const defaultAdmin = {
            username: 'admin',
            email: 'admin@local.com',
            password: 'admin123',
            fullName: 'Local Admin',
            organization: 'Local Organization',
            location: 'Local',
            role: 'admin',
            creditType: 'renewable-energy',
            permissions: [
                'manage_users',
                'manage_credits',
                'manage_prices',
                'withdraw_funds',
                'view_analytics',
                'manage_listings'
            ],
            adminMetadata: {
                accessLevel: 'super_admin',
                isContractOwner: true
            },
            isActive: true
        };

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: defaultAdmin.email });
        if (existingAdmin) {
            console.log('Admin account already exists with email:', defaultAdmin.email);
            console.log('You can login with:');
            console.log('Email:', defaultAdmin.email);
            console.log('Password:', defaultAdmin.password);
            return;
        }

        // Create new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);

        const adminUser = new User({
            ...defaultAdmin,
            password: hashedPassword
        });

        await adminUser.save();
        console.log('Successfully created local admin account');
        console.log('\nLogin credentials:');
        console.log('Email:', defaultAdmin.email);
        console.log('Password:', defaultAdmin.password);
        console.log('\nYou can now login at: http://localhost:3000/admin/login');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

makeAdmin(); 