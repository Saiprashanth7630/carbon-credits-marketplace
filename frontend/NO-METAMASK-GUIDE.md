# Using the Carbon Credits Marketplace without MetaMask

This guide explains how to use the Carbon Credits Marketplace application with direct Ganache connection without needing MetaMask.

## Overview

The application has been simplified to connect directly to Ganache for blockchain operations. This means:

1. You don't need to install MetaMask or any browser extension
2. All blockchain operations use a predefined account from Ganache
3. You can focus on the application functionality without wallet management

## Setup Instructions

1. **Start Ganache**

   Make sure Ganache is running on the default port (7545):
   ```
   npx ganache --port 7545
   ```

   Take note of the first account address and private key displayed in Ganache.

2. **Configure the Application**

   If needed, update the default private key in `src/services/blockchainService.js` to match your Ganache account:

   ```javascript
   // Default private key to use with Ganache (update with your Ganache account)
   defaultPrivateKey: 'your-ganache-private-key'
   ```

3. **Start the Application**

   Start the development server:
   ```
   npm run dev
   ```

4. **Verify the Setup**

   You can verify the setup is working correctly by running:
   ```
   node scripts/verify-no-metamask.js
   ```

   This should display the price per carbon credit from your contract and confirm the connection is working.

## How It Works

1. When the application loads, it automatically connects to Ganache using the specified private key
2. All blockchain transactions are signed using this key
3. The application interacts with your deployed contract at address `0x7169cB2f6Cc2447DeBBF0b799964F8BC1DE6Df34`

## Troubleshooting

1. **Connection Issues**
   - Make sure Ganache is running on port 7545
   - Check the console for any connection errors

2. **Transaction Issues**
   - Verify the account has enough ETH for gas fees
   - Ensure the contract address is correct

3. **Contract Interaction Failures**
   - Make sure the contract is deployed at the specified address
   - Check the contract ABI matches the deployed contract

## Security Considerations

This implementation uses a hardcoded private key for simplicity in development. For production use:

1. NEVER include private keys in your code
2. Consider implementing a secure key management solution
3. Implement proper authentication for blockchain operations

## Benefits of No-MetaMask Approach

1. Simplified user experience - no need to manage wallet connection
2. Faster development iteration - no wallet confirmation dialogs
3. Easier testing - consistent account without manual approvals
4. Works in any browser or environment without extensions 