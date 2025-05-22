import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Tooltip
} from '@mui/material';
import { ShoppingCart, Sell, ArrowUpward, ArrowDownward, AccountBalanceWallet, AccountBalance } from '@mui/icons-material';
import { getAllTransactions, getTransactionsForWallet } from '../services/transactionService';
import { useMetaMask } from '../hooks/useMetaMask';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { account, active, connect, error: metaMaskError } = useMetaMask();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      if (active && account) {
        try {
          // Only fetch if wallet is connected
          const fetchedTransactions = await getTransactionsForWallet(account);
          // Process transactions to add additional info
          const processedTransactions = fetchedTransactions.map(tx => ({
            ...tx,
            id: tx._id || `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date: tx.timestamp ? new Date(tx.timestamp).toISOString() : new Date().toISOString(),
            status: 'completed',
            isUserWallet: active && account && tx.walletAddress.toLowerCase() === account.toLowerCase()
          }));
          setTransactions(processedTransactions);
        } catch (err) {
          console.error("Error fetching transactions:", err);
          setError(err.response?.data?.message || 'Failed to load transaction history');
        } finally {
          setLoading(false);
        }
      } else {
        // No wallet connected: show nothing
        setTransactions([]);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account, active]);

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please make sure MetaMask is installed and unlocked.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'buy':
        return <ShoppingCart fontSize="small" />;
      case 'sell':
        return <Sell fontSize="small" />;
      case 'transfer_in':
        return <ArrowDownward fontSize="small" />;
      case 'transfer_out':
        return <ArrowUpward fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatType = (type) => {
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
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return '-';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Transaction History</Typography>
        {!active && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccountBalance />}
            onClick={handleConnectWallet}
          >
            Connect MetaMask
          </Button>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {metaMaskError && <Alert severity="error" sx={{ mb: 2 }}>{metaMaskError}</Alert>}
      
      {!active && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please connect your MetaMask wallet to view your transactions.
          <Button
            variant="outlined"
            size="small"
            startIcon={<AccountBalance />}
            onClick={handleConnectWallet}
            sx={{ ml: 2 }}
          >
            Connect Wallet
          </Button>
        </Alert>
      )}

      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Wallet</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>{transaction._id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(transaction.type)}
                            {formatType(transaction.type)}
                          </Box>
                        </TableCell>
                        <TableCell>{transaction.amount} Credits</TableCell>
                        <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                        <TableCell>
                          <Tooltip title={transaction.walletAddress || '-'}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {formatWalletAddress(transaction.walletAddress)}
                              {transaction.walletAddress === account && (
                                <Chip 
                                  label="Your Wallet" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                  sx={{ ml: 1, fontSize: '0.7rem' }} 
                                />
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)} 
                            color={getStatusColor(transaction.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.description || '-'}
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
            <Typography variant="body1">
              {active 
                ? 'No transactions found in the system.'
                : 'Please connect your MetaMask wallet to view your transactions.'}
            </Typography>
            {!active && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AccountBalance />}
                onClick={handleConnectWallet}
                sx={{ mt: 2 }}
              >
                Connect MetaMask
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Transactions; 