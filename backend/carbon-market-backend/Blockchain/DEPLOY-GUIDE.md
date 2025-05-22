# Quick Deployment Guide for Carbon Credits Marketplace

This guide provides step-by-step instructions for deploying the Carbon Credits Marketplace contract using Ganache GUI and integrating it with the frontend.

## Prerequisites

- Ganache GUI is installed and running
- Node.js is installed
- All dependencies are installed (`npm install` in both the root directory and Blockchain directory)

## Step 1: Configure Ganache GUI

1. Open Ganache GUI
2. Create a new workspace (or use an existing one)
3. Configure the workspace with:
   - Port Number: 7545
   - Network ID: 1337
   - Gas Limit: 6721975 (default)
   - Gas Price: 20000000000 (20 Gwei, default)

## Step 2: Configure Hardhat with Ganache Account

1. In Ganache GUI, select an account to use for deployment
2. Click the key icon to view the private key
3. Copy the private key (without the "0x" prefix)
4. Open `hardhat.config.js` in this directory
5. Replace the existing private key in the `ganache` network configuration:

```javascript
ganache: {
  url: "http://127.0.0.1:7545",
  chainId: 1337,
  accounts: [
    "PASTE_YOUR_PRIVATE_KEY_HERE" // Replace with your copied key
  ]
}
```

## Step 3: Deploy the Contract

Run the following command from the Blockchain directory:

```bash
npm run full-deploy
```

This will:
1. Deploy the contract to your Ganache network
2. Save deployment information to `deployment-log.txt`
3. Update the frontend service with the contract address
4. Copy the ABI to the frontend

## Step 4: Verify Deployment

1. Check the deployment log to confirm successful deployment
2. In Ganache GUI, go to the "Transactions" tab to see the contract creation transaction
3. Note the contract address - it should match what's in `deployment-log.txt`

## Step 5: Run the Frontend

Go back to the root directory and start the application:

```bash
cd ../..
npm start
```

## Troubleshooting

If you encounter issues:

1. **Contract not found or deployment fails**:
   - Ensure Ganache is running on port 7545
   - Check that the private key in `hardhat.config.js` matches an account in your Ganache instance
   - Verify the account has sufficient ETH (it should in a default Ganache setup)

2. **Frontend not updated correctly**:
   - You can manually update the frontend with:
     ```bash
     node scripts/update-frontend.js YOUR_CONTRACT_ADDRESS
     ```

3. **General connectivity issues**:
   - Restart Ganache and try again
   - Check for any firewall issues blocking connections to port 7545

## Additional Commands

- Deploy only: `npm run deploy`
- Update frontend only: `npm run update-frontend YOUR_CONTRACT_ADDRESS`

## Important Files

- `hardhat.config.js` - Network configuration
- `scripts/deploy.js` - Contract deployment script
- `scripts/update-frontend.js` - Script to update frontend with contract info
- `deployment-log.txt` - Log of the latest deployment
- `../../src/services/blockchainService.js` - Frontend service to interact with the contract 