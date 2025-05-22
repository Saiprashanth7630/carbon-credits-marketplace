const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function testUserLogin(email, password) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful');
    
    // Find user by email
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found with the provided email');
      return false;
    }
    
    console.log('User found, checking password...');
    
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (validPassword) {
      console.log('Password is valid! Login would be successful');
      console.log('User details:');
      
      const userObj = user.toObject();
      delete userObj.password;  // Remove sensitive info
      
      console.log(JSON.stringify(userObj, null, 2));
      return true;
    } else {
      console.log('Invalid password');
      return false;
    }
    
  } catch (error) {
    console.error('Test login failed:', error);
    return false;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Test with the user we found
console.log('Testing login for existing user:');
testUserLogin('23r11a6208@gcet.edu.in', 'testpassword')
  .then(() => {
    console.log('\nTesting login with test user:');
    return testUserLogin('test@example.com', 'password123');
  })
  .catch(error => {
    console.error('Error:', error);
  }); 