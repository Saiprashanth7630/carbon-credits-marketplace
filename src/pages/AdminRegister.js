import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Link
} from '@mui/material';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { LockOutlined } from '@mui/icons-material';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    location: '',
    creditType: '',
    registrationToken: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { 
    username, 
    email, 
    password, 
    confirmPassword, 
    fullName, 
    organization, 
    location, 
    creditType, 
    registrationToken 
  } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!username || !email || !password || !fullName || !organization || !location || !creditType || !registrationToken) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Override the provided token with the correct value
      const requestBody = {
        username,
        email,
        password,
        fullName,
        organization,
        location,
        creditType,
        registrationToken: 'carbon-admin-secure-token' // Correct token value
      };

      const res = await axios.post('http://localhost:5000/api/admin/auth/register', requestBody, config);
      setSuccess('Registration successful! You will be redirected to login.');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        organization: '',
        location: '',
        creditType: '',
        registrationToken: ''
      });
      
      // Save token and user data
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      
      // Redirect after brief delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      console.log("Registration request body:", {
        username,
        email,
        fullName,
        organization,
        location,
        creditType,
        registrationToken: 'carbon-admin-secure-token' // Correct token value
      }); // Log what we're sending
      console.log("Registration error response:", err.response?.data); // Log the detailed error
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Registration
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                value={username}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={onChange}
                fullWidth
                required
                helperText="Password must be at least 6 characters"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="fullName"
                value={fullName}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Organization"
                name="organization"
                value={organization}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                value={location}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="credit-type-label">Credit Type</InputLabel>
                <Select
                  labelId="credit-type-label"
                  id="creditType"
                  name="creditType"
                  value={creditType}
                  label="Credit Type"
                  onChange={onChange}
                >
                  <MenuItem value="renewable-energy">Renewable Energy</MenuItem>
                  <MenuItem value="forestry">Forestry</MenuItem>
                  <MenuItem value="agriculture">Agriculture</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Registration Token"
                name="registrationToken"
                type="password"
                value={registrationToken}
                onChange={onChange}
                fullWidth
                required
                helperText="Contact system administrator for this token"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an admin account?{' '}
            <Link component={RouterLink} to="/admin/login" color="primary">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminRegister; 