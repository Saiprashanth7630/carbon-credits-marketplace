import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import { Co2, Forest, Park, Agriculture, Factory, MonetizationOn, CheckCircle, BarChart, ShoppingCart, Sell } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Layout/Navbar';

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleAction = (action) => {
        if (!user) {
            navigate('/login');
            return;
        }
        switch (action) {
            case 'buy':
                navigate('/app/buy-credits');
                break;
            case 'sell':
                navigate('/app/sell-request');
                break;
            case 'wallet':
                navigate('/app/wallet');
                break;
            default:
                break;
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
                {/* Hero Section */}
                <Paper 
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        backgroundImage: 'linear-gradient(to right, #43a047, #2e7d32)',
                        color: 'white',
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        Understanding Carbon Credits
                    </Typography>
                    <Typography variant="h6" paragraph>
                        Your comprehensive guide to carbon offsetting and the carbon credit marketplace
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Discover how individuals and organizations can take responsibility for their carbon footprint
                        through carbon credit trading, directly supporting environmental projects worldwide.
                    </Typography>
                </Paper>

                {/* Take Action Box */}
                <Paper elevation={2} sx={{ p: 3, mb: 5, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom color="primary" textAlign="center">
                        Take Action Now
                    </Typography>
                    <Typography variant="body1" paragraph textAlign="center">
                        Ready to participate in the carbon credit marketplace? Get started here:
                    </Typography>
                    
                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<ShoppingCart />}
                                onClick={() => handleAction('buy')}
                                sx={{ py: 1.5 }}
                            >
                                Buy Carbon Credits
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button                                variant="outlined"                                fullWidth                                startIcon={<Sell />}                                onClick={() => handleAction('sell')}                                sx={{ py: 1.5 }}                            >                                Register My Generated Credits                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                color="secondary"
                                onClick={() => handleAction('wallet')}
                                sx={{ py: 1.5 }}
                            >
                                Check Wallet Balance
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* What are Carbon Credits */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        What are Carbon Credits?
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Carbon credits are tradable permits or certificates that represent the right to emit one metric ton of carbon dioxide (CO₂) 
                        or an equivalent amount of other greenhouse gases. They work on a simple principle:
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <Co2 color="primary" sx={{ fontSize: 60 }} />
                                    </Box>
                                    <Typography variant="h6" align="center" gutterBottom>
                                        Emission Reduction
                                    </Typography>
                                    <Typography variant="body2" align="center">
                                        Projects that reduce greenhouse gas emissions generate carbon credits.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <MonetizationOn color="primary" sx={{ fontSize: 60 }} />
                                    </Box>
                                    <Typography variant="h6" align="center" gutterBottom>
                                        Credits Traded
                                    </Typography>
                                    <Typography variant="body2" align="center">
                                        These credits can be bought, sold, or traded in the carbon market.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <CheckCircle color="primary" sx={{ fontSize: 60 }} />
                                    </Box>
                                    <Typography variant="h6" align="center" gutterBottom>
                                        Offset Emissions
                                    </Typography>
                                    <Typography variant="body2" align="center">
                                        Purchasers use credits to offset their own emissions, effectively balancing their carbon footprint.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* How Carbon Credits Work */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        How Do Carbon Credits Work?
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Carbon credits function within a "cap and trade" system or voluntary markets where:
                    </Typography>
                    
                    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                        <List>
                            <ListItem>
                                <ListItemIcon><BarChart color="primary" /></ListItemIcon>
                                <ListItemText 
                                    primary="Step 1: Cap on Emissions" 
                                    secondary="Regulatory bodies set limits on how much greenhouse gas certain industries can emit"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><Park color="primary" /></ListItemIcon>
                                <ListItemText 
                                    primary="Step 2: Project Development" 
                                    secondary="Projects that reduce, remove, or avoid greenhouse gas emissions are developed"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
                                <ListItemText 
                                    primary="Step 3: Verification" 
                                    secondary="Third-party organizations verify and certify emission reductions"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
                                <ListItemText 
                                    primary="Step 4: Trading" 
                                    secondary="Credits are bought and sold on carbon markets, with prices varying based on project type and quality"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Box>

                {/* Types of Carbon Credit Projects */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        Types of Carbon Credit Projects
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Carbon credits are generated from diverse project types, each with unique environmental benefits:
                    </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Forest color="primary" sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h6">Forestry & Conservation</Typography>
                                        <Typography variant="body2">
                                            Reforestation, afforestation, and preventing deforestation to preserve natural carbon sinks
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Park color="primary" sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h6">Renewable Energy</Typography>
                                        <Typography variant="body2">
                                            Solar, wind, hydroelectric, and geothermal projects that replace fossil fuel energy sources
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Agriculture color="primary" sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h6">Sustainable Agriculture</Typography>
                                        <Typography variant="body2">
                                            Improved farming practices that reduce emissions or increase carbon sequestration in soil
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ mb: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Factory color="primary" sx={{ fontSize: 40 }} />
                                    <Box>
                                        <Typography variant="h6">Industrial Emissions Reduction</Typography>
                                        <Typography variant="body2">
                                            Capturing methane from landfills, improving energy efficiency, or reducing industrial pollutants
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Carbon Credits Benefits */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        Benefits of Carbon Credits
                    </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Environmental Impact
                                    </Typography>
                                    <Typography variant="body2">
                                        • Reduces global greenhouse gas emissions<br />
                                        • Preserves biodiversity and natural habitats<br />
                                        • Promotes sustainable resource management
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Social Benefits
                                    </Typography>
                                    <Typography variant="body2">
                                        • Creates jobs in green sectors<br />
                                        • Improves public health through reduced pollution<br />
                                        • Supports vulnerable communities
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Economic Advantages
                                    </Typography>
                                    <Typography variant="body2">
                                        • Stimulates investment in clean technologies<br />
                                        • Creates new market opportunities<br />
                                        • Helps businesses meet regulatory requirements
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Getting Started */}
                <Box>
                    <Typography variant="h4" gutterBottom color="primary">
                        How to Get Started with Carbon Credits
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Whether you're an individual or a business, here's how you can participate in the carbon credit market:
                    </Typography>
                    
                    <Paper elevation={1} sx={{ p: 3 }}>
                        <List>
                            <ListItem>
                                <ListItemText 
                                    primary="1. Calculate Your Carbon Footprint" 
                                    secondary="Use online calculators to determine your emissions from daily activities, travel, and energy use"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText 
                                    primary="2. Reduce Emissions First" 
                                    secondary="Implement changes to reduce your carbon footprint before offsetting the remainder"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText 
                                    primary="3. Research Carbon Offset Projects" 
                                    secondary="Look for verified projects that align with your values and have strong environmental integrity"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText 
                                    primary="4. Understanding Carbon Credits" 
                                    secondary="Learn how carbon credits work in global markets and how they're valued based on project type and impact"
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText 
                                    primary="5. Track and Report" 
                                    secondary="Monitor your offset portfolio and the impact of your contributions"
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Home; 