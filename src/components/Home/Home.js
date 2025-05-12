import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import { ShoppingCart, Sell } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [userCredits, setUserCredits] = useState(0);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user) {
            fetchUserCredits();
        }
    }, [user]);

    const fetchUserCredits = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/getBalance');
            const data = await response.json();
            if (data.success) {
                setUserCredits(data.balance);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch carbon credits balance');
        }
    };

    const carbonCreditInfo = [
        {
            title: "What are Carbon Credits?",
            content: "Carbon credits are permits that represent one ton of carbon dioxide removed from the atmosphere. They provide a way to reduce greenhouse gas emissions by enabling companies and individuals to compensate for their carbon footprint."
        },
        {
            title: "How do Carbon Credits Work?",
            content: "When you purchase a carbon credit, you're investing in projects that reduce greenhouse gas emissions. These projects might include renewable energy, forest conservation, or methane capture initiatives."
        },
        {
            title: "Benefits of Trading",
            content: "Trading carbon credits helps finance environmental projects, supports sustainable development, and provides a market-based solution to combat climate change. It allows organizations to meet their emission reduction targets efficiently."
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Hero Section */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    mb: 4, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    borderRadius: 2
                }}
            >
                <Typography variant="h3" gutterBottom>
                    Carbon Credits Marketplace
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Make a positive impact on the environment through carbon credit trading
                </Typography>
                {user && (
                    <Typography variant="subtitle1">
                        Your Current Balance: {userCredits} Carbon Credits
                    </Typography>
                )}
            </Paper>

            {/* Information Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {carbonCreditInfo.map((info, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {info.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {info.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Action Buttons */}
            {user ? (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCart />}
                        onClick={() => navigate('/buy-credits')}
                    >
                        Buy Carbon Credits
                    </Button>
                    {userCredits > 0 && (
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<Sell />}
                            onClick={() => navigate('/sell-credits')}
                        >
                            Sell Carbon Credits
                        </Button>
                    )}
                </Box>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Ready to Start Trading?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </Button>
                    </Box>
                </Paper>
            )}
        </Container>
    );
};

export default Home; 