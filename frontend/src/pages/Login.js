import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);
      const { user, token } = response.data;

      if (!token) {
        console.error('No token received from server');
        setError('Login failed: No token received');
        return;
      }

      console.log('Storing token in localStorage');
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken ? 'Token stored successfully' : 'Token not stored');

      // Redirect based on user role
      if (user.role === 'admin') {
        // Verify admin permissions before redirecting
        try {
          console.log('Verifying admin access...');
          const adminCheck = await axios.get('http://localhost:5000/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (adminCheck.data.canAccessAdminPortal) {
            console.log('Admin access verified, redirecting to admin dashboard');
            navigate('/admin/dashboard');
          } else {
            console.log('Admin access denied');
            setError('You do not have access to the admin portal');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (err) {
          console.error('Admin verification failed:', err);
          setError('Failed to verify admin access');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('Regular user, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/register" variant="body2">
              Don't have an account? Register
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 