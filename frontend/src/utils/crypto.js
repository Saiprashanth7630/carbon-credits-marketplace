/**
 * Utility functions for cryptographic operations
 */

/**
 * Generate a SHA-256 hash of the input data
 * @param {string} data - The data to hash
 * @returns {Promise<string>} The hexadecimal hash
 */
export const generateHash = async (data) => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Hash generation error:', error);
    throw new Error('Failed to generate hash');
  }
};

/**
 * Encrypt data using AES-GCM
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {Promise<string>} The encrypted data as a base64 string
 */
export const encryptData = async (data, key) => {
  try {
    // Create a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert the key to a CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      new TextEncoder().encode(data)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - The encrypted data as a base64 string
 * @param {string} key - The decryption key
 * @returns {Promise<string>} The decrypted data
 */
export const decryptData = async (encryptedData, key) => {
  try {
    // Convert base64 to Uint8Array
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Convert the key to a CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    
    return new TextDecoder().decode(decryptedBuffer);
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
export const generateRandomString = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify a signature
 * @param {string} data - The data that was signed
 * @param {string} signature - The signature to verify
 * @param {string} secret - The secret key used for signing
 * @returns {Promise<boolean>} Whether the signature is valid
 */
export const verifySignature = async (data, signature, secret) => {
  try {
    const expectedSignature = await generateHash(data + secret);
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}; 