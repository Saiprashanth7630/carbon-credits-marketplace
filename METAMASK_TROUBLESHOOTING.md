# MetaMask Troubleshooting Guide

## The `eth_maxPriorityFeePerGas` Error

If you're seeing this error in your console:

```
MetaMask - RPC Error: The method "eth_maxPriorityFeePerGas" does not exist / is not available.
```

This is happening because:

1. Your application is using MetaMask with a Ganache local blockchain
2. MetaMask is trying to use EIP-1559 gas estimation features (introduced in the London fork)
3. Ganache doesn't support this RPC method by default

## Solution

We've implemented a fix in the `blockchainService.js` file that handles this error by:

1. Intercepting the unsupported `eth_maxPriorityFeePerGas` method calls
2. Providing a fixed gas price as a fallback
3. Using consistent gas configuration for all transactions

## How to Use MetaMask with this Application

1. **Configure MetaMask with Ganache:**
   - Open MetaMask → Add Network → Add a network manually
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import a Ganache Account:**
   - Run `node scripts/fix-account-display.js` to see the available accounts
   - Copy one of the private keys (without the 0x prefix)
   - In MetaMask: Click your account icon → Import Account → Paste the private key

3. **Using the Application:**
   - Ensure MetaMask is connected to `Ganache Local` network
   - Use the account you imported for the sender
   - Use another Ganache account address for the receiver
   - The application should now handle the RPC error automatically

## Still Having Issues?

Try these steps:

1. **Restart Ganache:**
   - If Ganache was already running, you might need to restart it
   - Run `npx ganache --port 7545 --chain.chainId 1337 --wallet.deterministic`

2. **Clear MetaMask Cache:**
   - In MetaMask, go to Settings → Advanced → Reset Account
   - This will clear your transaction history and cached data

3. **Fix Port Conflicts:**
   - Check if another process is using port 7545:
     - Windows: `netstat -ano | findstr :7545`
     - Linux/Mac: `lsof -i :7545`
   - Terminate the process using that port or use a different port

4. **Run Diagnostic Scripts:**
   - `node scripts/check-ganache.js` - Verifies Ganache connection
   - `node scripts/metamask-helper.js` - Configuration guide
   - `node scripts/fix-account-display.js` - Shows correct accounts and private keys

## Technical Details

The error is fixed by creating a custom middleware in the provider that intercepts the unsupported RPC method:

```javascript
// Add a custom middleware to handle unsupported methods
const originalSend = provider.send;
provider.send = async function(method, params) {
  // Handle unsupported methods for Ganache
  if (method === 'eth_maxPriorityFeePerGas') {
    console.log("Intercepted eth_maxPriorityFeePerGas request - returning fixed gas price");
    return ethers.parseUnits("1", "gwei").toString();
  }
  
  // Proceed with the original request for other methods
  return originalSend.call(this, method, params);
};
```

This approach allows MetaMask to function properly with Ganache while maintaining compatibility with modern Ethereum features. 