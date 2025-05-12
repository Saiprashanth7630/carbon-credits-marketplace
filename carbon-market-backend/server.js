const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://23r11a6208:Y7bG7ld1AzaGDXQI@cluster0.pxdbvoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB database connection established successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Carbon Credits Marketplace API' });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
}); 