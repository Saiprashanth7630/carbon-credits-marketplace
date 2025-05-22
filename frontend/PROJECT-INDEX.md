# Carbon Credits Marketplace Project Index

## Project Overview
This is a Carbon Credits Marketplace built using React for the frontend and a Node.js/Express backend, with smart contract integration using Hardhat and Ethereum blockchain technology.

## Directory Structure

### Frontend (React)
- **src/** - Frontend source code
  - **components/** - React components
  - **pages/** - Page-level React components
  - **services/** - Service files for API calls and blockchain interactions
  - **hooks/** - React custom hooks
  - **utils/** - Utility functions
  - **connectors/** - Web3 connection helpers
  - **contracts/** - Contract ABIs and interfaces
  - **artifacts/** - Contract build artifacts
  - **types/** - TypeScript type definitions
  - **App.js** - Main application component
  - **index.js** - Application entry point
  - **theme.js** - Theme configuration
  - **config.js** - Frontend configuration

### Backend (Express)
- **backend/** - Backend server code
  - **models/** - Mongoose data models
  - **routes/** - Express API routes
  - **middleware/** - Express middleware
  - **utils/** - Utility functions
  - **contracts/** - Smart contract related files
  - **server.js** - Express server entry point
  - **config.js** - Backend configuration

### Smart Contracts (Solidity)
- **contracts/** - Smart contract source code
  - **CarbonMarketplace.sol** - Main marketplace contract

### Build & Deployment
- **scripts/** - Deployment and utility scripts
- **build/** - Build output directory
- **cache/** - Build cache

### Configuration
- **package.json** - Node.js dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **babel.config.js** - Babel configuration

### Documentation
- **README.md** - Main project documentation
- **README-BLOCKCHAIN.md** - Blockchain integration documentation
- **METAMASK_TROUBLESHOOTING.md** - MetaMask setup guide
- **NO-METAMASK-GUIDE.md** - Guide for using the app without MetaMask

## Key Files

### Smart Contracts
- `contracts/CarbonMarketplace.sol` - Main marketplace contract for carbon credits trading

### Backend
- `backend/server.js` - Express server setup
- `backend/routes/` - API route definitions
- `backend/models/` - Database models

### Frontend
- `src/App.js` - Main React application
- `src/index.js` - Application entry point
- `src/services/` - API and blockchain services

### Configuration
- `package.json` - Project dependencies and scripts

## Setup & Deployment

See `README.md` and `README-BLOCKCHAIN.md` for detailed setup instructions.

## Scripts
- `npm start` - Start the React development server
- `npm run build` - Build the React application
- `npm run deploy-contract` - Deploy smart contracts to local blockchain
- `npm run blockchain:setup` - Set up the blockchain environment 