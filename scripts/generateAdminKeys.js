const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Function to generate a secure random string
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to generate SHA-256 hash
async function generateHash(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

// Function to format key for display
function formatKey(key) {
  // Split into groups of 4 characters for better readability
  return key.match(/.{1,4}/g).join('-');
}

async function generateAdminKeys(count = 5) {
  console.log('Generating admin keys...\n');
  
  const keys = [];
  
  for (let i = 0; i < count; i++) {
    const key = generateSecureKey();
    const hash = await generateHash(key);
    
    keys.push({
      key: formatKey(key),
      hash: hash
    });
    
    console.log(`Admin Key ${i + 1}:`);
    console.log(`Key: ${formatKey(key)}`);
    console.log(`Hash: ${hash}`);
    console.log('-------------------\n');
  }
  
  // Save to file
  const output = {
    generatedAt: new Date().toISOString(),
    keys: keys
  };
  
  const outputPath = path.join(__dirname, 'admin-keys.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`\nKeys have been saved to: ${outputPath}`);
  console.log('\nIMPORTANT:');
  console.log('1. Keep these keys secure and share them only with trusted administrators');
  console.log('2. Add the hash to your backend .env file as ADMIN_KEY_HASH');
  console.log('3. Delete this file after distributing the keys');
}

// Generate 5 admin keys
generateAdminKeys().catch(console.error); 