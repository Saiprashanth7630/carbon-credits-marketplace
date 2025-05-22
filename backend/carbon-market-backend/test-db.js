const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful');
    
    // Check if users exist
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database`);
    
    if (users.length > 0) {
      // Print user emails only (not full info for privacy)
      console.log('User emails:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.username})`);
      });
    } else {
      console.log('No users found in the database');
      
      // Create a test user
      console.log('Creating a test user...');
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '$2a$10$6Bnv6uDJjB.P3NFw.V7t2.7O8rKFNhUvxEXbWaRPWTBjUJ3uSNIHe', // "password123" hashed
        fullName: 'Test User',
        organization: 'Test Org',
        role: 'Buyer',
        location: 'Test Location',
        creditType: 'renewable-energy'
      });
      
      await newUser.save();
      console.log('Test user created successfully');
    }
    
  } catch (error) {
    console.error('MongoDB test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testConnection(); 