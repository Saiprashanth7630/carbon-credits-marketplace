const mongoose = require('mongoose');
const User = require('../carbon-market-backend/models/User');
require('dotenv').config();

// MongoDB connection string from .env or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Function to promote a regular user to admin
async function makeUserAdmin(userEmail) {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        // Find the user by email
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            console.error(`User with email ${userEmail} not found`);
            return;
        }

        console.log(`Found user: ${user.fullName} (${user.email})`);
        
        // Update user to admin role
        user.role = 'admin';
        user.permissions = [
            'manage_users',
            'manage_credits',
            'manage_prices',
            'view_analytics',
            'manage_listings'
        ];
        user.adminMetadata = {
            accessLevel: 'admin',
            isContractOwner: false
        };

        // Save the updated user
        await user.save();
        
        console.log(`Successfully updated ${user.fullName} to admin role!`);
        console.log('Updated user details:');
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Admin Level:', user.adminMetadata.accessLevel);
        console.log('\nYou can now login at: http://localhost:3000/admin/login');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
    console.error('Please provide a user email address as an argument');
    console.log('Usage: node scripts/makeExistingUserAdmin.js user@example.com');
    process.exit(1);
}

makeUserAdmin(userEmail); 