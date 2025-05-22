const crypto = require('crypto');

/**
 * Generate a SHA-256 hash of the input data
 * @param {string} data - The data to hash
 * @returns {Promise<string>} The hexadecimal hash
 */
const generateHash = async (data) => {
  try {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  } catch (error) {
    console.error('Hash generation error:', error);
    throw new Error('Failed to generate hash');
  }
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {Promise<string>} The encrypted data as a base64 string
 */
const encryptData = async (data, key) => {
  try {
    // Generate a random IV
    const iv = crypto.randomBytes(12);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    
    // Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, encrypted data, and auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'base64'),
      authTag
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - The encrypted data as a base64 string
 * @param {string} key - The decryption key
 * @returns {Promise<string>} The decrypted data
 */
const decryptData = async (encryptedData, key) => {
  try {
    // Convert base64 to buffer
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, encrypted data, and auth tag
    const iv = combined.slice(0, 12);
    const authTag = combined.slice(-16);
    const encrypted = combined.slice(12, -16);
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generate a secure random string
 * @param {number} length - The length of the string
 * @returns {string} The random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Verify a signature
 * @param {string} data - The data that was signed
 * @param {string} signature - The signature to verify
 * @param {string} secret - The secret key used for signing
 * @returns {Promise<boolean>} Whether the signature is valid
 */
const verifySignature = async (data, signature, secret) => {
  try {
    const expectedSignature = await generateHash(data + secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Generate a secure token
 * @param {Object} data - The data to include in the token
 * @param {string} secret - The secret key
 * @param {number} expiresIn - Token expiration time in seconds
 * @returns {Promise<string>} The generated token
 */
const generateToken = async (data, secret, expiresIn = 3600) => {
  try {
    const payload = {
      ...data,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    };
    
    const tokenData = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = await generateHash(tokenData + secret);
    
    return `${tokenData}.${signature}`;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify a token
 * @param {string} token - The token to verify
 * @param {string} secret - The secret key
 * @returns {Promise<Object|null>} The decoded token data or null if invalid
 */
const verifyToken = async (token, secret) => {
  try {
    const [tokenData, signature] = token.split('.');
    if (!tokenData || !signature) {
      return null;
    }
    
    const expectedSignature = await generateHash(tokenData + secret);
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(tokenData, 'base64').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

module.exports = {
  generateHash,
  encryptData,
  decryptData,
  generateRandomString,
  verifySignature,
  generateToken,
  verifyToken
}; 