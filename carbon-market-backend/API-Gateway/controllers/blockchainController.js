const { ethers, JsonRpcProvider } = require('ethers');
require('dotenv').config();
const contractABI = require('../abi/CarbonCreditsMarketplaceABI.json');

const provider = new JsonRpcProvider(process.env.RPC_NODE_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

const getPrice = async (req, res) => {
    try {
        const price = await contract.pricePerCarbonCredit();
        res.json({ price: ethers.utils.formatUnits(price, "ether") });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error retrieving price of carbon credits" });
    }
};

const purchaseCarbonCredits = async (req, res) => {
    try {
        const amount = req.body.amount;
        const price = await contract.pricePerCarbonCredit();
        const totalPrice = ethers.utils.parseUnits((price * amount).toString(), "wei");

        const tx = await contract.purchaseCarbonCredits(amount, {
            value: totalPrice,
        });
        await tx.wait();

        res.json({ message: "Carbon Credits Purchased", transactionHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Purchase failed" });
    }
};

const transferCarbonCredits = async (req, res) => {
    try {
        const { recipient, amount } = req.body;
        const tx = await contract.transferCarbonCredits(recipient, amount);
        await tx.wait();

        res.json({ message: "Transfer successful", transactionHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Transfer failed" });
    }
};

const getCarbonCredits = async (req, res) => {
    try {
        const address = req.query.address;
        const credits = await contract.carbonCredits(address);
        res.json({ credits: credits.toString() });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Retrieval failed" });
    }
};

const updatePrice = async (req, res) => {
    try {
        const newPrice = ethers.utils.parseUnits(req.body.newPrice, "ether");
        const tx = await contract.updatePrice(newPrice);
        await tx.wait();
        res.json({ message: "Price Updated", transactionHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Update failed" });
    }
};

const withdrawFunds = async (req, res) => {
    try {
        const tx = await contract.withdraw();
        await tx.wait();
        res.json({ message: "Withdrawn", transactionHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Withdraw failed" });
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
