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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import axios from 'axios';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  organization: string;
  role: 'Buyer' | 'Seller';
  location: string;
  creditType: 'renewable-energy' | 'forestry' | 'agriculture' | 'industrial';
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    role: 'Buyer',
    location: '',
    creditType: 'renewable-energy',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev: RegisterFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate all required fields
    const requiredFields = ['username', 'email', 'password', 'fullName', 'organization', 'role', 'location', 'creditType'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        organization: formData.organization,
        role: formData.role,
        location: formData.location,
        creditType: formData.creditType,
      });

      const { token, user } = response.data;

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('walletAddress', user.walletAddress || '');
      
      // If user has a private key, store it securely
      if (user.privateKey) {
        localStorage.setItem('privateKey', user.privateKey);
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
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
            Create Account
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
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleTextChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleTextChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleTextChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleTextChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="fullName"
              label="Full Name"
              id="fullName"
              value={formData.fullName}
              onChange={handleTextChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="organization"
              label="Organization"
              id="organization"
              value={formData.organization}
              onChange={handleTextChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleSelectChange}
              >
                <MenuItem value="Buyer">Buyer</MenuItem>
                <MenuItem value="Seller">Seller</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="location"
              label="Location"
              id="location"
              value={formData.location}
              onChange={handleTextChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="creditType-label">Credit Type</InputLabel>
              <Select
                labelId="creditType-label"
                id="creditType"
                name="creditType"
                value={formData.creditType}
                label="Credit Type"
                onChange={handleSelectChange}
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
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 