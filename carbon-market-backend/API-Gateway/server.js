require('dotenv').config();
const express = require('express');
const cors = require('cors');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/blockchain', blockchainRoutes); // All blockchain logic is modularized

app.listen(port, () => {
    console.log(`Blockchain server running on port ${port}`);
});
