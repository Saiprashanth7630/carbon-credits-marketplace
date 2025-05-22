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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    role: '',
    location: '',
    creditType: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate all required fields
    const requiredFields = ['username', 'email', 'password', 'fullName', 'organization', 'role', 'location', 'creditType'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        organization: formData.organization,
        role: formData.role,
        location: formData.location,
        creditType: formData.creditType
      });

      // Store token and redirect to dashboard
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user._id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="Buyer">Buyer</MenuItem>
              <MenuItem value="Seller">Seller</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="creditType-label">Credit Type</InputLabel>
            <Select
              labelId="creditType-label"
              id="creditType"
              name="creditType"
              value={formData.creditType}
              label="Credit Type"
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="renewable-energy">Renewable Energy</MenuItem>
              <MenuItem value="forestry">Forestry</MenuItem>
              <MenuItem value="agriculture">Agriculture</MenuItem>
              <MenuItem value="industrial">Industrial</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Already have an account? Login
            </Link>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Register; 