const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/default');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const secret = config.jwtSecret || process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('Admin auth failed: No authorization header');
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Admin auth failed: No token in authorization header');
            return res.status(401).json({ message: 'No token provided' });
        }

        console.log('Admin auth: Verifying token');
        const secret = config.jwtSecret || process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = jwt.verify(token, secret);
        console.log('Admin auth: Token decoded', decoded);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('Admin auth failed: User not found');
            return res.status(403).json({ message: 'User not found' });
        }
        
        if (user.role !== 'admin') {
            console.log('Admin auth failed: User is not admin', user.role);
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        console.log('Admin auth: Success for user', user._id);
        req.user = user;
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check specific permission
const hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.userId);
            
            if (!user || !user.hasPermission(permission)) {
                return res.status(403).json({ 
                    message: `Requires permission: ${permission}` 
                });
            }

            req.user = user;
            next();
        } catch (err) {
            return res.status(500).json({ message: 'Error verifying permission' });
        }
    };
};

// Middleware to check if user can access admin portal
const canAccessAdminPortal = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user || !user.canAccessAdminPortal()) {
            return res.status(403).json({ 
                message: 'You do not have access to the admin portal' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Error verifying admin portal access' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    hasPermission,
    canAccessAdminPortal
}; 