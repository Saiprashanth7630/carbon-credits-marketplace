import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    KeyboardArrowDown,
    Menu as MenuIcon,
    ShoppingCart,
    LocalOffer,
    Storefront,
    School,
    Assessment,
    Calculate,
    Person,
    Receipt,
    Logout,
    Home,
    Sell
} from '@mui/icons-material';

const Navbar = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [anchorEl, setAnchorEl] = useState(null);
    const [marketAnchorEl, setMarketAnchorEl] = useState(null);
    const [resourcesAnchorEl, setResourcesAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMarketMenuOpen = (event) => setMarketAnchorEl(event.currentTarget);
    const handleResourcesMenuOpen = (event) => setResourcesAnchorEl(event.currentTarget);

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMarketAnchorEl(null);
        setResourcesAnchorEl(null);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        handleMenuClose();
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const handleNavigation = (path) => {
        handleMenuClose();
        navigate(path);
    };

    const marketMenuItems = [
        { text: 'Buy Credits', path: '/buy-credits', icon: <ShoppingCart /> },
        { text: 'Sell Credits', path: '/sell-credits', icon: <LocalOffer /> },
        { text: 'Browse Marketplace', path: '/marketplace', icon: <Storefront /> }
    ];

    const resourceMenuItems = [
        { text: 'Learn About Carbon Credits', path: '/learn', icon: <School /> },
        { text: 'Market Reports', path: '/reports', icon: <Assessment /> },
        { text: 'Carbon Calculator', path: '/calculator', icon: <Calculate /> }
    ];

    const profileMenuItems = [
        { text: 'Profile', path: '/profile', icon: <Person /> },
        { text: 'My Transactions', path: '/transactions', icon: <Receipt /> }
    ];

    const renderMobileMenu = () => (
        <Drawer
            anchor="right"
            open={mobileMenuOpen}
            onClose={handleMobileMenuToggle}
            sx={{ '& .MuiDrawer-paper': { width: 280 } }}
        >
            <List sx={{ pt: 2 }}>
                {user && (
                    <>
                        <ListItem button onClick={() => handleNavigation('/')}>
                            <ListItemIcon><Home /></ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem>
                            <ListItemText primary="Market" sx={{ color: 'text.secondary' }} />
                        </ListItem>
                        {marketMenuItems.map((item) => (
                            <ListItem button key={item.path} onClick={() => handleNavigation(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <ListItem>
                            <ListItemText primary="Resources" sx={{ color: 'text.secondary' }} />
                        </ListItem>
                        {resourceMenuItems.map((item) => (
                            <ListItem button key={item.path} onClick={() => handleNavigation(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        {profileMenuItems.map((item) => (
                            <ListItem button key={item.path} onClick={() => handleNavigation(item.path)}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><Logout /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                )}
                {!user && (
                    <>
                        <ListItem button onClick={() => handleNavigation('/login')}>
                            <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem button onClick={() => handleNavigation('/register')}>
                            <ListItemText primary="Sign Up" />
                        </ListItem>
                    </>
                )}
            </List>
        </Drawer>
    );

    return (
        <AppBar 
            position="static" 
            elevation={1}
            sx={{
                backgroundColor: 'white',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar 
                sx={{ 
                    minHeight: '48px !important', 
                    px: { xs: 1, sm: 2 },
                    py: 0.5
                }}
            >
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexShrink: 0,
                        fontSize: '1rem',
                        fontWeight: 500
                    }}
                >
                    🌿 Carbon Credits
                </Typography>

                {user && !isMobile && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.25, 
                        mx: 1, 
                        flexGrow: 1, 
                        justifyContent: 'center'
                    }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/"
                            startIcon={<Home />}
                            sx={{ 
                                whiteSpace: 'nowrap',
                                px: 1,
                                py: 0.5,
                                minWidth: 'auto',
                                fontSize: '0.875rem'
                            }}
                        >
                            Home
                        </Button>

                        <Button
                            color="inherit"
                            startIcon={<ShoppingCart />}
                            onClick={() => handleNavigation('/buy-credits')}
                            sx={{ 
                                whiteSpace: 'nowrap',
                                px: 1,
                                py: 0.5,
                                minWidth: 'auto',
                                fontSize: '0.875rem'
                            }}
                        >
                            Buy
                        </Button>

                        <Button
                            color="inherit"
                            startIcon={<Sell />}
                            onClick={() => handleNavigation('/sell-credits')}
                            sx={{ 
                                whiteSpace: 'nowrap',
                                px: 1,
                                py: 0.5,
                                minWidth: 'auto',
                                fontSize: '0.875rem'
                            }}
                        >
                            Sell
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    {user ? (
                        <>
                            {!isMobile && (
                                <IconButton
                                    color="inherit"
                                    onClick={handleProfileMenuOpen}
                                    sx={{ 
                                        p: 0.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            width: 28, 
                                            height: 28, 
                                            bgcolor: 'primary.main',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {user.fullName?.charAt(0) || 'U'}
                                    </Avatar>
                                </IconButton>
                            )}
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                sx={{ mt: 0.5 }}
                                PaperProps={{
                                    elevation: 2,
                                    sx: { minWidth: 180 }
                                }}
                            >
                                {profileMenuItems.map((item) => (
                                    <MenuItem 
                                        key={item.path} 
                                        onClick={() => handleNavigation(item.path)}
                                        dense
                                        sx={{ py: 0.75 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: '0.875rem' }}
                                        />
                                    </MenuItem>
                                ))}
                                <Divider />
                                <MenuItem 
                                    onClick={handleLogout}
                                    dense
                                    sx={{ py: 0.75 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Logout sx={{ fontSize: 20 }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary="Logout"
                                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                                    />
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        !isMobile && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button 
                                    color="inherit" 
                                    component={Link} 
                                    to="/login"
                                    sx={{ 
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Login
                                </Button>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    component={Link}
                                    to="/register"
                                    sx={{ 
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )
                    )}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            onClick={handleMobileMenuToggle}
                            edge="end"
                            sx={{ p: 0.5 }}
                        >
                            <MenuIcon sx={{ fontSize: 24 }} />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
            {renderMobileMenu()}
        </AppBar>
    );
};

export default Navbar; 