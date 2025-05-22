# Carbon Credits Marketplace - Blockchain Integration

This document provides instructions for setting up the blockchain integration for the Carbon Credits Marketplace application using Ganache and Hardhat.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Ganache](https://www.trufflesuite.com/ganache) - Local Ethereum blockchain
- [MetaMask](https://metamask.io/) - Browser extension wallet (optional for development)

## Setup Instructions

### 1. Install Dependencies

First, make sure all dependencies are installed.

```bash
# Install frontend dependencies
npm install

# Install blockchain dependencies
cd carbon-market-backend/Blockchain
npm install
cd ../..
```

### 2. Start Ganache

Start Ganache with the following settings:

- **Port Number**: 7545
- **Network ID**: 1337
- **Gas Limit**: 6721975
- **Gas Price**: 20000000000 (20 Gwei)

You can use either the Ganache GUI or Ganache CLI:

```bash
# Using Ganache CLI (if installed)
npx ganache-cli -p 7545 -i 1337 --gasLimit 6721975 --gasPrice 20000000000
```

### 3. Configure Hardhat

Ensure the private key in `carbon-market-backend/Blockchain/hardhat.config.js` matches one of the accounts in your Ganache instance.

1. Open Ganache
2. Click on any account
3. Click the key icon to view the private key
4. Copy the private key (WITHOUT the 0x prefix)
5. Update the private key in `hardhat.config.js`:

```javascript
accounts: [
  "YOUR_PRIVATE_KEY_HERE"
]
```

### 4. Deploy the Contract

Run the deployment script to deploy the contract to your local Ganache instance:

```bash
node scripts/deploy-local.js
```

This script will:
- Deploy the contract to Ganache
- Update the contract address in `blockchainService.js`
- Copy the contract ABI to the frontend

### 5. Configure MetaMask (Optional)

If you're using MetaMask for development:

1. Add a new network to MetaMask:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import an account from Ganache using its private key

### 6. Start the Frontend Application

```bash
npm start
```

The application will now connect to your local Ganache blockchain.

## Troubleshooting

### Contract Not Found

If you see "Contract not available" errors:

1. Verify Ganache is running
2. Check that the contract address in `src/services/blockchainService.js` matches the deployed contract
3. Run the deployment script again: `node scripts/deploy-local.js`

### Transaction Errors

If transactions fail:

1. Make sure your MetaMask (or active account) has sufficient ETH
2. Check that you're on the correct network (Ganache)
3. Verify the contract ABI matches the deployed contract

### Network Connection Issues

If the application can't connect to Ganache:

1. Verify Ganache is running on port 7545
2. Check your firewall settings
3. Try restarting Ganache

## Contract Information

The CarbonCreditsMarketplace contract has the following functions:

- `purchaseCarbonCredits(uint256 amount)` - Purchase carbon credits
- `transferCarbonCredits(address recipient, uint256 amount)` - Transfer credits to another user
- `carbonCredits(address)` - View carbon credits balance
- `pricePerCarbonCredit()` - Get current price per credit

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Ganache Documentation](https://www.trufflesuite.com/docs/ganache/overview)
- [ethers.js Documentation](https://docs.ethers.io/v5/) 