import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layout Components
import Layout from './components/Layout/Layout';

// Page Components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WalletBalances from './pages/WalletBalances';
import Transactions from './pages/Transactions';
import AdminRoute from './components/AdminRoute';
import Home from './components/Home/Home';
import BuyCredits from './components/BuyCredits/BuyCredits';
import SellCredits from './components/SellCredits/SellCredits';
import SellCreditRequest from './components/SellCreditRequest/SellCreditRequest';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminSettings from './pages/AdminSettings';
import AdminCreditReviews from './pages/AdminCreditReviews';

// Auth Protection Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/" element={<Home />} />

        {/* Protected Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<WalletBalances />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="buy-credits" element={<BuyCredits />} />
          <Route path="sell-credits" element={<SellCredits />} />
          <Route path="sell-request" element={<SellCreditRequest />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="credit-reviews" element={<AdminCreditReviews />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
