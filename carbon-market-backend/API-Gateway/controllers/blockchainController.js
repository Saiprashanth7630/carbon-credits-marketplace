const { ethers, JsonRpcProvider } = require('ethers');
require('dotenv').config();
const contractABI = require('../abi/CarbonCreditsMarketplaceABI.json');

console.log(process.env.RPC_NODE_URL);
// Set up wallet and provider
const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

// Controller function to get the current price per carbon credit
const getPrice = async (req, res) => {
    try {
        const price = await contract.pricePerCarbonCredit();
        res.json({ price: ethers.utils.formatUnits(price, "ether") });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error retrieving price of carbon credits" });
    }
};

// Controller function to purchase carbon credits
const purchaseCarbonCredits = async (req, res) => {
    try {
        const amount = req.query.amount;
        const totalPrice = ethers.utils.parseUnits(amount * (await contract.pricePerCarbonCredit()).toString(), "ether");
        
        const tx = await wallet.sendTransaction({
            to: process.env.CONTRACT_ADDRESS,
            value: totalPrice,
        });

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Call the purchaseCarbonCredits function
        await contract.purchaseCarbonCredits(amount, { from: wallet.address });
        
        res.json({
            message: "Carbon Credits Purchased Successfully",
            transactionHash: receipt.transactionHash,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error occurred while purchasing carbon credits" });
    }
};

// Controller function to transfer carbon credits
const transferCarbonCredits = async (req, res) => {
    try {
        const recipient = req.query.recipient;
        const amount = req.query.amount;

        // Call the transfer function
        const tx = await contract.transferCarbonCredits(recipient, amount);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        res.json({
            message: "Carbon Credits Transferred Successfully",
            transactionHash: receipt.transactionHash,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error occurred while transferring carbon credits" });
    }
};

// Controller function to get the carbon credits of a specific address
const getCarbonCredits = async (req, res) => {
    try {
        const address = req.query.address;
        const credits = await contract.carbonCredits(address);
        res.json({ credits: credits.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error occurred while retrieving carbon credits" });
    }
};

// Controller function to update the price of carbon credits (owner only)
const updatePrice = async (req, res) => {
    try {
        const newPrice = ethers.utils.parseUnits(req.query.newPrice, "ether");
        
        // Call the updatePrice function on the contract
        const tx = await contract.updatePrice(newPrice);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        res.json({
            message: "Price Updated Successfully",
            transactionHash: receipt.transactionHash,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error occurred while updating price" });
    }
};

// Controller function to withdraw funds (owner only)
const withdrawFunds = async (req, res) => {
    try {
        const tx = await contract.withdraw();
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        res.json({
            message: "Funds Withdrawn Successfully",
            transactionHash: receipt.transactionHash,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error occurred while withdrawing funds" });
    }
};

module.exports = {
    getPrice,
    purchaseCarbonCredits,
    transferCarbonCredits,
    getCarbonCredits,
    updatePrice,
    withdrawFunds,
};
