import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useMetaMask } from '../../hooks/useMetaMask';
import { initializeBlockchain } from '../../services/blockchainService';
import { supportedChains } from '../../services/web3Config';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import './SellCreditRequest.css';

const SellCreditRequest = () => {
  const { account, active, library, chainId, switchNetwork, connect } = useMetaMask();
  
  // Form fields
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState([]);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [sellRequests, setSellRequests] = useState([]);
  const [expanded, setExpanded] = useState(false);

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (active && library) {
      initializeContract();
    }
  }, [active, library]);

  // Fetch user's existing sell requests when component mounts
  useEffect(() => {
    fetchSellRequests();
  }, []);

  const initializeContract = async () => {
    try {
      const { contract } = await initializeBlockchain(library);
      setContract(contract);
      // No longer need to check credits
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize blockchain connection. Please try again.');
    }
  };

  const fetchSellRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping sell requests fetch');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/sell-requests/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSellRequests(response.data.sellRequests);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!active) {
      setError('Please connect your wallet first.');
      return;
    }
    
    if (chainId !== supportedChains.GANACHE) {
      try {
        await switchNetwork(supportedChains.GANACHE);
      } catch (error) {
        setError('Please switch to the correct network.');
        return;
      }
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    
    // No longer checking against existing balance since we're registering new generated credits
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to register your carbon credits.');
        setLoading(false);
        return;
      }
      
      // Default price for all credits (set by admin)
      const defaultPrice = 0.25;
      
      console.log('Submitting request with data:', {
        walletAddress: account,
        amount: amountNum,
        description: description,
        price: defaultPrice
      });
      console.log('Using token:', token);
      
      // Simple JSON request without document upload for now
      const response = await axios.post('http://localhost:5000/api/sell-requests/submit', 
        {
          walletAddress: account,
          amount: amountNum,
          description: description,
          price: defaultPrice  // Explicitly include price as it's required by the backend model
        }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        
      console.log('Response received:', response);
      
      setSuccess('Credit registration submitted successfully! An admin will verify your submission.');
      setAmount('');
      setDescription('');
      setDocuments([]);
      
      // Refresh sell requests
      fetchSellRequests();
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting sell request:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        setError(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('Request made but no response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setError('Error: ' + error.message);
      }
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this sell request?')) {
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/sell-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Sell request canceled successfully.');
      
      // Refresh sell requests
      fetchSellRequests();
      
      setLoading(false);
    } catch (error) {
      console.error('Error canceling sell request:', error);
      setError('Failed to cancel sell request.');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="primary" align="center">
          Register Generated Carbon Credits
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'info.light', 
            color: 'info.contrastText',
            p: 2, 
            borderRadius: 1, 
            mb: 3 
          }}
        >
          <InfoIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Your generated carbon credits must be verified and approved by an administrator before they can be made available in the marketplace.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        {!active ? (
          <Box textAlign="center" mb={3}>
            <Typography variant="body1" gutterBottom>
              Please connect your wallet to register your generated credits.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={connect}
              sx={{ mt: 2 }}
            >
              Connect Wallet
            </Button>
          </Box>
        ) : (
          <>
            <Box mb={4}>
              <Typography variant="body2" color="text.secondary">
                Connected wallet: {account}
              </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Register Your Generated Credits
              </Typography>
              <TextField
                label="Amount of Generated Credits"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  inputProps: { min: 1, step: 1 }
                }}
              />
              
              <TextField
                label="Description (optional)"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                placeholder="Provide details about your carbon credit generation project..."
              />
              
              <Box mt={3} textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading || !active || !account}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Credits'}
                </Button>
              </Box>
            </form>
          </>
        )}
        
        <Divider sx={{ mt: 4, mb: 3 }} />
        
        <Accordion 
          expanded={expanded} 
          onChange={() => setExpanded(!expanded)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Your Credit Registration Requests ({sellRequests.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {sellRequests.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sellRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>{formatDate(request.submittedDate)}</TableCell>
                        <TableCell>{request.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleCancel(request._id)}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          )}
                          {request.status === 'rejected' && request.adminNotes && (
                            <Typography variant="caption" color="text.secondary">
                              Reason: {request.adminNotes}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                You haven't registered any carbon credits yet.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default SellCreditRequest; 