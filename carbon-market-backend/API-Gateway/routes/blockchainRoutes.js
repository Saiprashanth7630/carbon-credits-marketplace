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

router.get('/getPrice', getPrice);
router.post('/purchase', purchaseCarbonCredits);
router.post('/transfer', transferCarbonCredits);
router.get('/getCarbonCredits', getCarbonCredits);
router.post('/updatePrice', updatePrice);
router.post('/withdrawFunds', withdrawFunds);

module.exports = router;
