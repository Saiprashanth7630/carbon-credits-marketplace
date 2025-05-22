import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Receipt,
    AccountBalanceWallet,
    Person,
    Logout,
    Dashboard,
    People,
    Settings
} from '@mui/icons-material';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check for regular user or admin user
        const regularUser = JSON.parse(localStorage.getItem('user') || 'null');
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        
        if (adminUser && location.pathname.startsWith('/admin')) {
            setUser(adminUser);
            setIsAdmin(true);
        } else if (regularUser) {
            setUser(regularUser);
            setIsAdmin(false);
        } else {
            setUser(null);
            setIsAdmin(false);
        }
    }, [location.pathname]);

    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => {
        setAnchorEl(null);
        setMobileMenuOpen(false);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        
        handleMenuClose();
        
        // Redirect based on current path
        if (location.pathname.startsWith('/admin')) {
            navigate('/admin/login');
        } else {
            navigate('/login');
        }
    };

    const handleNavigation = (path) => {
        handleMenuClose();
        navigate(path);
    };

    // Define menu items based on user type
    const regularMenuItems = [
        { text: 'My Transactions', icon: <Receipt />, path: '/app/transactions' },
        { text: 'Wallet', icon: <AccountBalanceWallet />, path: '/app/wallet' },
        { text: 'Profile', icon: <Person />, path: '/app/profile' }
    ];

    const adminMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Users', icon: <People />, path: '/admin/users' },
        { text: 'Transactions', icon: <Receipt />, path: '/admin/transactions' },
        { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
    ];

    const menuItems = isAdmin ? adminMenuItems : regularMenuItems;

    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
                elevation: 3,
                sx: {
                    mt: 1.5,
                    minWidth: 200
                }
            }}
        >
            {menuItems.map((item) => (
                <MenuItem 
                    key={item.text} 
                    onClick={() => handleNavigation(item.path)}
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                </MenuItem>
            ))}
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                    <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
            </MenuItem>
        </Menu>
    );

    const renderMobileMenu = (
        <Drawer
            anchor="right"
            open={mobileMenuOpen}
            onClose={handleMobileMenuToggle}
            PaperProps={{
                sx: {
                    width: 250,
                    pt: 2
                }
            }}
        >
            <List>
                {menuItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.text}
                        onClick={() => handleNavigation(item.path)}
                        sx={{ py: 1.5 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <ListItem 
                    button 
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: 'error.main' }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Drawer>
    );

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to={isAdmin ? "/admin/dashboard" : "/"}
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    🌿 Carbon Credits
                    {isAdmin && (
                        <Chip
                            label="ADMIN"
                            size="small"
                            color="secondary"
                            sx={{ ml: 1, height: 20 }}
                        />
                    )}
                </Typography>

                <Button
                    component={Link}
                    to={isAdmin ? "/admin/dashboard" : "/"}
                    sx={{
                        textTransform: 'none',
                        color: 'inherit',
                        ml: 2,
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                >
                    {isAdmin ? 'Dashboard' : 'Home'}
                </Button>

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        {isMobile ? (
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMobileMenuToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        ) : (
                            <Button
                                onClick={handleProfileMenuOpen}
                                startIcon={<Avatar sx={{ width: 24, height: 24, bgcolor: isAdmin ? 'secondary.main' : 'primary.main' }}>{user?.fullName?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</Avatar>}
                                endIcon={<MenuIcon />}
                                sx={{ 
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                {user.fullName || user.name || user.email?.split('@')[0] || 'User'}
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <Button
                            color="primary"
                            variant="contained"
                            component={Link}
                            to={location.pathname.startsWith('/admin') ? "/admin/login" : "/login"}
                        >
                            Login
                        </Button>
                    </Box>
                )}
            </Toolbar>
            {renderMenu}
            {renderMobileMenu}
        </AppBar>
    );
};

export default Navbar; 