const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        console.log('==== AUTH MIDDLEWARE DEBUG ====');
        console.log('Headers:', JSON.stringify(req.headers));
        
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('Auth middleware: No authorization header found');
            return res.status(401).json({ message: 'No authorization header provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('Auth middleware: No token found in authorization header');
            return res.status(401).json({ message: 'No token provided' });
        }

        console.log('Auth middleware: Token found:', token.substring(0, 10) + '...');

        try {
            // First try to verify token if it's a JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
            console.log('JWT Token verified:', decoded);
            
            // Find the user by ID from the decoded token
            const user = await User.findById(decoded.userId);
            if (!user) {
                console.log('User not found with decoded ID:', decoded.userId);
                return res.status(401).json({ message: 'Invalid token - user not found' });
            }
            
            console.log('User found by JWT:', user._id);
            req.user = user;
            req.userId = user._id;
            return next();
        } catch (jwtError) {
            console.log('JWT verification failed, trying database lookup:', jwtError.message);
            
            // If JWT verification fails, try the old method
            const user = await User.findOne({
                $or: [
                    { 'auth.token': token },
                    { token: token }
                ]
            });

            if (!user) {
                console.log('Auth middleware: No user found with token');
                return res.status(401).json({ message: 'Invalid token' });
            }

            console.log('Auth middleware: User found via DB lookup:', user._id);
            
            // Set user and userId on request
            req.user = user;
            req.userId = user._id;
            next();
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ message: 'Authentication failed: ' + err.message });
    }
};

module.exports = auth; 