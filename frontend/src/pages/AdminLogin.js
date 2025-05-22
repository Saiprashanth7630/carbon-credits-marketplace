import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Link
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import axios from 'axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Logging in admin with:', formData.email);
            const response = await axios.post('http://localhost:5000/api/admin/auth/login', formData);
            
            console.log('Admin login response:', response.data);
            
            if (!response.data.token) {
                throw new Error('No token received from server');
            }
            
            const { token, user } = response.data;
            
            // Store admin auth data
            localStorage.removeItem('token'); // Clear any existing tokens first
            localStorage.removeItem('adminToken');
            
            localStorage.setItem('adminToken', token);
            localStorage.setItem('token', token); // Set both for backwards compatibility
            localStorage.setItem('adminUser', JSON.stringify(user));

            // Verify token immediately
            try {
                const verifyResponse = await axios.get('http://localhost:5000/api/admin/auth/check-token', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Token verification:', verifyResponse.data);
                
                if (!verifyResponse.data.user.isAdmin) {
                    throw new Error('User is not an admin');
                }
            } catch (verifyErr) {
                console.error('Token verification failed:', verifyErr);
                // Continue anyway, just for debugging
            }
            
            // Redirect to admin dashboard
            navigate('/admin/dashboard');
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.response?.data?.message || 'Failed to login as admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        backgroundColor: '#f5f5f5'
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}
                    >
                        <LockOutlined sx={{ color: 'white' }} />
                    </Box>

                    <Typography component="h1" variant="h5" gutterBottom>
                        Admin Portal Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Admin Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>

                    <Box mt={2}>
                        <Typography variant="body2" align="center" color="text.secondary">
                            Need help? Contact your system administrator.
                        </Typography>
                    </Box>
                </Paper>

                <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                        Don't have an admin account?{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/admin/register')}
                            sx={{ textDecoration: 'none' }}
                        >
                            Register here
                        </Link>
                    </Typography>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate('/login')}
                        sx={{ textDecoration: 'none' }}
                    >
                        Back to User Login
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default AdminLogin; 