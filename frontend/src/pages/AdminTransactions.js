import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Link
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import { useMetaMask } from '../hooks/useMetaMask';

const AdminTransactions = () => {
  const { isConnected, account } = useMetaMask();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalCreditsTraded: 0,
    totalEthVolume: 0,
    avgTransactionSize: 0
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: '',
    walletAddress: ''
  });
  
  // Transaction details dialog
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      console.log('Using token for AdminTransactions:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get('http://localhost:5000/api/admin/management/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTransactions(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (transactionData) => {
    let totalCredits = 0;
    let totalEth = 0;
    
    transactionData.forEach(tx => {
      if (tx.amount) {
        totalCredits += parseFloat(tx.amount);
      }
      
      if (tx.ethAmount) {
        totalEth += parseFloat(tx.ethAmount);
      }
    });
    
    setStats({
      totalTransactions: transactionData.length,
      totalCreditsTraded: totalCredits,
      totalEthVolume: totalEth,
      avgTransactionSize: transactionData.length > 0 ? (totalCredits / transactionData.length).toFixed(2) : 0
    });
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDetailsDialog(true);
  };
  
  const applyFilters = (tx) => {
    // Filter by type
    if (filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }
    
    // Filter by wallet address
    if (filters.walletAddress && !tx.walletAddress?.toLowerCase().includes(filters.walletAddress.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate) {
      const endDateWithTime = new Date(filters.endDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      if (new Date(tx.date) > endDateWithTime) {
        return false;
      }
    }
    
    return true;
  };
  
  const filteredTransactions = transactions.filter(applyFilters);
  
  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'buy':
        return 'Purchase';
      case 'sell':
        return 'Sale';
      case 'transfer_in':
        return 'Transfer In';
      case 'transfer_out':
        return 'Transfer Out';
      default:
        return type;
    }
  };
  
  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'primary';
      case 'transfer_in':
        return 'info';
      case 'transfer_out':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const exportTransactions = () => {
    // Simple CSV export
    const headers = ['Type', 'Amount', 'Date', 'Wallet Address', 'Transaction Hash', 'Description'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.type,
        tx.amount,
        new Date(tx.date).toISOString(),
        tx.walletAddress,
        tx.transactionHash,
        tx.description?.replace(/,/g, ';') || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccess('Transactions exported successfully');
    setTimeout(() => setSuccess(''), 3000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Transaction Management
          </Typography>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportTransactions}
              disabled={filteredTransactions.length === 0}
            >
              Export
            </Button>
            
            <IconButton
              color="primary"
              onClick={fetchTransactions}
              title="Refresh Data"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h4">{stats.totalTransactions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Credits Traded
                </Typography>
                <Typography variant="h4">{stats.totalCreditsTraded.toFixed(0)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  ETH Volume
                </Typography>
                <Typography variant="h4">{stats.totalEthVolume.toFixed(2)} ETH</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Avg. Transaction Size
                </Typography>
                <Typography variant="h4">{stats.avgTransactionSize} Credits</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Filters */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterAltIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6" component="div">
              Filters
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="type-filter-label">Transaction Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  name="type"
                  value={filters.type}
                  label="Transaction Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="buy">Purchase</MenuItem>
                  <MenuItem value="sell">Sale</MenuItem>
                  <MenuItem value="transfer_in">Transfer In</MenuItem>
                  <MenuItem value="transfer_out">Transfer Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                name="walletAddress"
                label="Wallet Address"
                variant="outlined"
                value={filters.walletAddress}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {/* Transactions Table */}
        {loading && !transactions.length ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredTransactions.length === 0 ? (
          <Alert severity="info">
            No transactions match your filters
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Wallet Address</TableCell>
                    <TableCell>Transaction Hash</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((tx) => (
                      <TableRow key={tx._id}>
                        <TableCell>
                          <Chip
                            label={getTransactionTypeLabel(tx.type)}
                            color={getTransactionTypeColor(tx.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{tx.amount} Credits</TableCell>
                        <TableCell>
                          {new Date(tx.date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatAddress(tx.walletAddress)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {tx.transactionHash ? (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatAddress(tx.transactionHash)}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTransaction(tx)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Transaction Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transaction Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transaction Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={getTransactionTypeLabel(selectedTransaction.type)}
                    color={getTransactionTypeColor(selectedTransaction.type)}
                    size="small"
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.amount} Credits
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedTransaction.date).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Wallet Address
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }} gutterBottom>
                  {selectedTransaction.walletAddress}
                </Typography>
              </Grid>
              
              {selectedTransaction.transactionHash && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction Hash
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }} gutterBottom>
                    {selectedTransaction.transactionHash}
                  </Typography>
                </Grid>
              )}
              
              {selectedTransaction.ethAmount && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ETH Amount
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.ethAmount} ETH
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.description || 'No description provided'}
                </Typography>
              </Grid>
              
              {selectedTransaction.userId && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Associated User
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.userId}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>
            Close
          </Button>
          {selectedTransaction?.transactionHash && (
            <Button
              component="a"
              href={`https://etherscan.io/tx/${selectedTransaction.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTransactions; 