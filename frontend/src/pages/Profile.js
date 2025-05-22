import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import { Person, Edit, Save, ShoppingCart, Sell, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { getAllTransactions } from '../services/transactionService';
import { useMetaMask } from '../hooks/useMetaMask';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { account, active, connect } = useMetaMask();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        organization: user.organization || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Reset form data when entering edit mode
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        organization: user.organization || '',
        phone: user.phone || ''
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would make an API call to update the user profile
      // For this demo, we'll just update the localStorage
      const updatedUser = {
        ...user,
        ...formData
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setTxLoading(true);
      setTxError('');

      try {
        if (!active || !account) {
          setTransactions([]);
          return;
        }

        const userTransactions = await getAllTransactions();
        const filteredTransactions = userTransactions
          .filter(tx => active && account && tx.walletAddress.toLowerCase() === account.toLowerCase())
          .map(tx => ({
            ...tx,
            id: tx.id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
            status: 'completed'
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(filteredTransactions);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTxError(err.response?.data?.message || 'Failed to load transaction history');
      } finally {
        setTxLoading(false);
      }
    };

    fetchTransactions();
  }, [account, active]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'buy':
        return <ShoppingCart color="primary" />;
      case 'sell':
        return <Sell color="secondary" />;
      case 'transfer_in':
        return <ArrowDownward color="success" />;
      case 'transfer_out':
        return <ArrowUpward color="error" />;
      default:
        return null;
    }
  };

  const getTransactionType = (type) => {
    switch (type) {
      case 'buy':
        return 'Purchase';
      case 'sell':
        return 'Sale';
      case 'transfer_in':
        return 'Received';
      case 'transfer_out':
        return 'Sent';
      default:
        return type;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You must be logged in to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Profile
          </Typography>
        </Grid>
        
        {error && <Alert severity="error" sx={{ mb: 3, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, width: '100%' }}>{success}</Alert>}

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mr: 3,
                  boxShadow: 2
                }}
              >
                {user.fullName?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 500 }}>
                  {user.fullName || 'User'}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                  {user.email || 'No email provided'}
                </Typography>
              </Box>
              <Button
                variant={editMode ? "outlined" : "contained"}
                color="primary"
                startIcon={editMode ? <Save /> : <Edit />}
                onClick={editMode ? handleSave : handleEditToggle}
                disabled={loading}
                size="large"
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                {loading ? <CircularProgress size={28} /> : (editMode ? 'Save' : 'Edit')}
              </Button>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  sx={{ mb: 3 }}
                  size="large"
                  InputProps={{
                    sx: { fontSize: '1.1rem', py: 1 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  sx={{ mb: 3 }}
                  size="large"
                  InputProps={{
                    sx: { fontSize: '1.1rem', py: 1 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  sx={{ mb: 3 }}
                  size="large"
                  InputProps={{
                    sx: { fontSize: '1.1rem', py: 1 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  sx={{ mb: 3 }}
                  size="large"
                  InputProps={{
                    sx: { fontSize: '1.1rem', py: 1 }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Transactions Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
              Recent Transactions
            </Typography>

            {txError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {txError}
              </Alert>
            )}

            {txLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : transactions.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getTransactionIcon(tx.type)}
                                <Typography>{getTransactionType(tx.type)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                color={tx.type === 'buy' || tx.type === 'transfer_in' ? 'success.main' : 'error.main'}
                                sx={{ fontWeight: 500 }}
                              >
                                {tx.type === 'buy' || tx.type === 'transfer_in' ? '+' : '-'}
                                {tx.amount} Credits
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(tx.date).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={tx.status}
                                color={tx.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={transactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {active 
                    ? 'No transactions found.'
                    : 'Please connect your MetaMask wallet to view your transactions.'}
                </Typography>
                {!active && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={connect}
                    sx={{ mt: 2 }}
                  >
                    Connect MetaMask
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 