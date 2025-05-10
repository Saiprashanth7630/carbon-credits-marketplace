const express = require('express');
const router = express.Router();
const {
    getPrice,
    purchaseCarbonCredits,
    transferCarbonCredits,
    getCarbonCredits,
    updatePrice,
    withdrawFunds,
} = require('../controllers/blockchainController');

// Route to get the current price per carbon credit
router.get('/getPrice', getPrice);

// Route to purchase carbon credits
router.post('/purchase', purchaseCarbonCredits);

// Route to transfer carbon credits to another user
router.post('/transfer', transferCarbonCredits);

// Route to get the carbon credits of a specific address
router.get('/getCarbonCredits', getCarbonCredits);

// Route to update the price of carbon credits (only by Owner)
router.post('/updatePrice', updatePrice);

// Route to withdraw funds from the contract (only by Owner)
router.post('/withdrawFunds', withdrawFunds);


module.exports = router;