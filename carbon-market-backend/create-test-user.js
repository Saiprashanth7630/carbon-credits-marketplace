const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists. Updating password...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update password
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('Test user password updated successfully');
    } else {
      // Create a new test user
      console.log('Creating new test user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        fullName: 'Test User',
        organization: 'Test Org',
        role: 'Buyer',
        location: 'Test Location',
        creditType: 'renewable-energy'
      });
      
      await newUser.save();
      console.log('New test user created successfully');
      console.log('Login credentials:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    }
    
  } catch (error) {
    console.error('Failed to create test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createTestUser(); 