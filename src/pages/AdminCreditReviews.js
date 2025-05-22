import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';

const AdminCreditReviews = () => {
  const navigate = useNavigate();
  const [sellRequests, setSellRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    pendingCredits: 0
  });
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('pending');
  
  useEffect(() => {
    fetchSellRequests();
    fetchStats();
  }, []);
  
  const fetchSellRequests = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/sell-requests/admin/all?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSellRequests(response.data.sellRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
      setError('Failed to fetch sell requests');
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/sell-requests/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const handleReviewOpen = (request) => {
    setSelectedRequest(request);
    setReviewStatus('approved');
    setReviewNotes('');
    setReviewDialogOpen(true);
  };
  
  const handleReviewClose = () => {
    setReviewDialogOpen(false);
  };
  
  const handleReviewSubmit = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/sell-requests/admin/review/${selectedRequest._id}`, {
        status: reviewStatus,
        adminNotes: reviewNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Sell request ${reviewStatus} successfully`);
      setReviewDialogOpen(false);
      
      // Refresh data
      fetchSellRequests();
      fetchStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error reviewing sell request:', error);
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    const statuses = ['pending', 'approved', 'rejected', 'all'];
    setTabValue(newValue);
    setFilterStatus(statuses[newValue]);
    fetchSellRequests();
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Credit Sell Request Reviews
          </Typography>
          
          <IconButton color="primary" onClick={() => { fetchSellRequests(); fetchStats(); }} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography variant="h4">{stats.pending}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {stats.pendingCredits} credits awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4">{stats.approved}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {stats.approvedCredits || 0} credits approved for sale
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4">{stats.rejected}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for filtering */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="sell request tabs">
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`Approved (${stats.approved})`} />
            <Tab label={`Rejected (${stats.rejected})`} />
            <Tab label="All Requests" />
          </Tabs>
        </Box>
        
        {/* Sell Requests Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : sellRequests.length === 0 ? (
          <Alert severity="info">
            No {filterStatus === 'all' ? '' : filterStatus} sell requests found
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Wallet</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Price (ETH)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{formatDate(request.submittedDate)}</TableCell>
                    <TableCell>
                      {request.userId?.fullName || 'Unknown User'}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {request.userId?.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {formatAddress(request.walletAddress)}
                    </TableCell>
                    <TableCell>{request.amount}</TableCell>
                    <TableCell>{request.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {request.description || '-'}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleReviewOpen(request)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewStatus('rejected');
                                setReviewDialogOpen(true);
                              }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {request.status !== 'pending' && request.adminNotes && (
                        <Tooltip title={request.adminNotes}>
                          <span>
                            <Typography variant="caption" color="text.secondary">
                              {request.adminNotes.length > 20 ? request.adminNotes.substring(0, 20) + '...' : request.adminNotes}
                            </Typography>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleReviewClose}>
        <DialogTitle>
          {reviewStatus === 'approved' ? 'Approve' : 'Reject'} Sell Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <DialogContentText>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {selectedRequest.userId?.fullName || 'Unknown User'} ({selectedRequest.userId?.email})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRangeIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Submitted on {formatDate(selectedRequest.submittedDate)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Request Details
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {selectedRequest.amount} credits
                </Typography>
                <Typography variant="body2">
                  <strong>Price:</strong> {selectedRequest.price} ETH per credit
                </Typography>
                <Typography variant="body2">
                  <strong>Total Value:</strong> {(selectedRequest.amount * selectedRequest.price).toFixed(4)} ETH
                </Typography>
                <Typography variant="body2">
                  <strong>Wallet:</strong> {selectedRequest.walletAddress}
                </Typography>
                {selectedRequest.description && (
                  <Typography variant="body2">
                    <strong>Description:</strong> {selectedRequest.description}
                  </Typography>
                )}
              </DialogContentText>
              
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="review-status-label">Status</InputLabel>
                  <Select
                    labelId="review-status-label"
                    value={reviewStatus}
                    label="Status"
                    onChange={(e) => setReviewStatus(e.target.value)}
                  >
                    <MenuItem value="approved">Approve</MenuItem>
                    <MenuItem value="rejected">Reject</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewStatus === 'rejected' 
                      ? 'Please provide a reason for rejection (will be visible to the user)' 
                      : 'Optional notes for approval'
                  }
                  required={reviewStatus === 'rejected'}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewClose} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleReviewSubmit} 
            color={reviewStatus === 'approved' ? 'success' : 'error'}
            variant="contained"
            disabled={reviewStatus === 'rejected' && !reviewNotes.trim()}
          >
            {loading ? <CircularProgress size={24} /> : reviewStatus === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCreditReviews; 