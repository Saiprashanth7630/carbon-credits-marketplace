require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/carbon-credits',
  
  // Security configuration
  jwtSecret: process.env.JWT_SECRET || generateRandomString(32),
  sessionSecret: process.env.SESSION_SECRET || generateRandomString(32),
  
  // Blockchain configuration
  ganacheUrl: process.env.GANACHE_URL || 'http://localhost:7545',
  contractAddress: process.env.CONTRACT_ADDRESS || '0xEd9d3bBa21e387B4554999035404452D5595D1F3',
  contractOwnerPrivateKey: process.env.CONTRACT_OWNER_PRIVATE_KEY || 'aa71e3bea55d9ba11ba79379dce30ce655dbb970f28621c2ee7daf43b22ca607',
  chainId: process.env.CHAIN_ID || 1337,
  
  // Rate limiting
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // 100 requests per window
  
  // Session configuration
  sessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
  tokenExpiry: 60 * 60, // 1 hour
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Email configuration
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@carboncredits.com'
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Helper function to generate random string
function generateRandomString(length) {
  return require('crypto')
    .randomBytes(length)
    .toString('hex');
}

module.exports = config; 