const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/adminAuth');
const config = require('../config/default');

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Admin auth routes are working!' });
});

// Public Admin Registration Route (Requires secret token for additional security)
router.post('/register', async (req, res) => {
    try {
        const { 
            username,
            email, 
            password, 
            fullName, 
            organization, 
            location, 
            registrationToken, 
            creditType 
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !fullName || !organization || !location || !creditType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if registration token is valid (should match environment variable or be stored in DB)
        const validToken = process.env.ADMIN_REGISTRATION_TOKEN || 'carbon-admin-secure-token';
        if (!registrationToken || registrationToken !== validToken) {
            return res.status(403).json({ message: 'Invalid registration token' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            organization,
            location,
            creditType,
            role: 'admin',
            permissions: [
                'manage_users',
                'manage_credits',
                'manage_prices',
                'view_analytics',
                'manage_listings'
            ],
            adminMetadata: {
                accessLevel: 'admin',
                isContractOwner: false
            },
            isActive: true
        });

        await adminUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: adminUser._id, role: adminUser.role },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Admin account created successfully',
            token,
            user: {
                id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email,
                fullName: adminUser.fullName,
                role: adminUser.role,
                accessLevel: adminUser.adminMetadata.accessLevel
            }
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Error creating admin account' });
    }
});

// Protected Admin Creation Route (Only for super admins to create other admins)
router.post('/signup', verifyToken, isAdmin, async (req, res) => {
    try {
        const { username, email, password, fullName, organization, location, creditType } = req.body;

        // Check if the requesting user is a super admin
        const requestingUser = await User.findById(req.userId);
        if (requestingUser.adminMetadata.accessLevel !== 'super_admin') {
            return res.status(403).json({ message: 'Only super admins can create new admin accounts' });
        }

        // Validate required fields
        if (!username || !email || !password || !fullName || !organization || !location || !creditType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            organization,
            location,
            creditType,
            role: 'admin',
            permissions: [
                'manage_users',
                'manage_credits',
                'manage_prices',
                'view_analytics',
                'manage_listings'
            ],
            adminMetadata: {
                accessLevel: 'admin',
                isContractOwner: false
            },
            isActive: true
        });

        await adminUser.save();

        res.status(201).json({
            message: 'Admin account created successfully',
            user: {
                id: adminUser._id,
                username: adminUser.username,
                email: adminUser.email,
                fullName: adminUser.fullName,
                role: adminUser.role,
                accessLevel: adminUser.adminMetadata.accessLevel
            }
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({ message: 'Error creating admin account' });
    }
});

// Admin Login Route (Separate from user login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find admin user
        const admin = await User.findOne({ 
            email,
            role: 'admin',
            isActive: true
        });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        // Update last login time
        admin.auth = admin.auth || {};
        admin.auth.lastLogin = new Date();
        admin.auth.token = token;
        await admin.save();

        // Send response
        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: admin._id,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                accessLevel: admin.adminMetadata.accessLevel,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Error during admin login' });
    }
});

// Admin Logout Route
router.post('/logout', verifyToken, async (req, res) => {
    try {
        const admin = await User.findById(req.userId);
        if (admin) {
            admin.auth = admin.auth || {};
            admin.auth.token = null;
            await admin.save();
        }
        res.json({ message: 'Admin logged out successfully' });
    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({ message: 'Error during admin logout' });
    }
});

// Verify Admin Access Route
router.get('/verify', verifyToken, async (req, res) => {
    try {
        const admin = await User.findById(req.userId);
        
        if (!admin || admin.role !== 'admin' || !admin.isActive) {
            return res.status(403).json({ 
                canAccessAdminPortal: false,
                message: 'Not authorized to access admin portal'
            });
        }

        res.json({
            canAccessAdminPortal: true,
            user: {
                id: admin._id,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                accessLevel: admin.adminMetadata.accessLevel,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ 
            canAccessAdminPortal: false,
            message: 'Error verifying admin access'
        });
    }
});

// Debug route to create a default admin user for testing
router.post('/create-default-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      return res.json({
        message: 'Default admin already exists',
        user: {
          id: existingAdmin._id,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }
    
    // Create a default admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      fullName: 'Admin User',
      organization: 'Carbon Credits',
      location: 'Global',
      creditType: 'renewable-energy',
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_credits',
        'manage_prices',
        'withdraw_funds',
        'view_analytics',
        'manage_listings'
      ],
      isActive: true
    });
    
    await adminUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    
    return res.status(201).json({
      message: 'Default admin created successfully',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      },
      token,
      login: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error creating default admin:', error);
    return res.status(500).json({ message: 'Error creating default admin', error: error.message });
  }
});

// Debug route to check token and user details
router.get('/check-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Decode token without verification to check payload
    const decodedToken = jwt.decode(token);
    console.log('Decoded token:', decodedToken);
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: 'Invalid token format', decoded: decodedToken });
    }
    
    // Check if user exists
    const user = await User.findById(decodedToken.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', userId: decodedToken.id });
    }
    
    return res.json({
      message: 'Token check',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      },
      tokenData: decodedToken
    });
  } catch (error) {
    console.error('Error checking token:', error);
    return res.status(500).json({ message: 'Error checking token', error: error.message });
  }
});

// Add a debug endpoint to check registration token
router.get('/debug/registration-token', async (req, res) => {
    try {
        const validToken = process.env.ADMIN_REGISTRATION_TOKEN || 'carbon-admin-secure-token';
        res.json({
            message: 'For security, only showing a hint of the token',
            tokenHint: `${validToken.substring(0, 5)}...${validToken.substring(validToken.length - 5)}`,
            tokenLength: validToken.length
        });
    } catch (error) {
        console.error('Error in registration token debug:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 