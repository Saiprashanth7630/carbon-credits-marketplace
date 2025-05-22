import React, { useState, ChangeEvent, FormEvent, SetStateAction, Dispatch } from 'react';
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
} from '@mui/material';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await axios.post('http://localhost:5000/api/users/login', formData);

      console.log('Login response:', response.data);

      // Handle different response formats:
      // 1. If response.data has user and token properties
      // 2. If response.data is the user object directly
      let user, token;
      
      if (response.data.user && response.data.token) {
        // Format: { user, token }
        user = response.data.user;
        token = response.data.token;
      } else if (response.data._id) {
        // The response is directly the user object
        user = response.data;
        // Generate a dummy token since the backend might not send one
        token = 'dummy-token-' + Date.now();
        console.log('Using direct user object format with generated token');
      } else {
        console.error('Unrecognized response format:', response.data);
        setError('Invalid server response format. Please try again.');
        setLoading(false);
        return;
      }

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('user', JSON.stringify(user)); // Store the full user object
      localStorage.setItem('walletAddress', user.walletAddress || '');
      
      // If user has a private key, store it securely
      if (user.privateKey) {
        localStorage.setItem('privateKey', user.privateKey);
      }

      console.log('Login successful, redirecting to dashboard');
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Failed to login');
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError('An unexpected error occurred.');
      }
    }
    setLoading(false);
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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 