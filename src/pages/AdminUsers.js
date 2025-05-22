import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: ''
  });
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      console.log('Using token for AdminUsers:', token ? 'Token exists' : 'No token found');
      
      const response = await axios.get('http://localhost:5000/api/admin/management/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    setOpenEditDialog(true);
  };
  
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/admin/management/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`User ${selectedUser.fullName} has been deleted`);
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      
      // Remove the deleted user from the list
      setUsers(users.filter(user => user._id !== selectedUser._id));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `http://localhost:5000/api/admin/management/users/${selectedUser._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in the list
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...response.data } : user
      ));
      
      setSuccess(`User ${editFormData.fullName} has been updated`);
      setOpenEditDialog(false);
      setSelectedUser(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleMakeAdmin = async (user) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `http://localhost:5000/api/admin/management/users/${user._id}/make-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the user in the list
      setUsers(users.map(u => 
        u._id === user._id ? { ...u, role: 'admin' } : u
      ));
      
      setSuccess(`User ${user.fullName} has been promoted to admin`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error making user admin:', error);
      setError('Failed to promote user: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
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
            User Management
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => {/* TODO: Implement create user logic */}}
          >
            Add New User
          </Button>
        </Box>
        
        {loading && !users.length ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'secondary' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {/* TODO: View user details */}}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            title="Edit User"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                            color="error"
                            disabled={user.role === 'admin'}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user {selectedUser?.fullName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="fullName"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.fullName}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editFormData.email}
            onChange={handleEditInputChange}
            sx={{ mb: 2 }}
          />
          {selectedUser?.role !== 'admin' && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleMakeAdmin(selectedUser)}
              disabled={loading}
              sx={{ mb: 1 }}
            >
              Promote to Admin
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers; 