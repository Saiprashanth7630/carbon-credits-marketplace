const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        console.log('Register attempt with:', req.body.email);
        const { 
            username, 
            email, 
            password,
            fullName,
            organization,
            role,
            location,
            creditType
        } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            organization,
            role,
            location,
            creditType
        });

        const savedUser = await newUser.save();
        const userResponse = { ...savedUser._doc };
        delete userResponse.password;

        // Generate a token (in a real app, use JWT)
        const token = require('crypto').randomBytes(64).toString('hex');

        console.log('Registration successful for:', email);
        console.log('Response format: { user, token }');
        
        res.status(201).json({ user: userResponse, token });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
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

        // Generate new token
        const token = require('crypto').randomBytes(64).toString('hex');
        const now = new Date();
        
        console.log('Generated new token for user:', email);
        
        // Update user with new token and last login time
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    'auth.token': token,
                    'auth.lastLogin': now,
                    lastLogin: now
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            console.error('Failed to update user token for:', email);
            throw new Error('Failed to update user token');
        }

        console.log('Successfully updated user token for:', email);
        
        const userResponse = { ...updatedUser._doc };
        delete userResponse.password;
        
        console.log('Login successful for:', email);
        console.log('Sending response with token');
        
        res.json({ user: userResponse, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update last login time
router.post('/update-last-login', auth, async (req, res) => {
    try {
        // Update last login time
        req.user.lastLogin = new Date();
        await req.user.save();

        res.json({ message: 'Last login time updated' });
    } catch (err) {
        console.error('Update last login error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 