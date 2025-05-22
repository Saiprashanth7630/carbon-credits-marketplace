const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const port = 5001; // Use a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Test Server Running' });
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid password' });
    }

    const userResponse = { ...user._doc };
    delete userResponse.password;

    // Generate a simple token
    const token = require('crypto').randomBytes(64).toString('hex');
    
    console.log('Login successful for:', email);
    console.log('Response format:', { user: userResponse, token: '(token omitted)' });
    
    // Return proper format with user and token
    res.json({ user: userResponse, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB database connection established successfully');
  
  // Start server after database connection
  app.listen(port, () => {
    console.log(`Test server is running on port: ${port}`);
    console.log(`You can test login at: http://localhost:${port}/api/users/login`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
}); 