import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Link,
} from '@mui/material';
import { AccountBalanceWallet, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';
import { useBlockchain } from '../state/BlockchainContext';
import WalletConnectModal from '../components/wallet/WalletConnectModal';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, isAuthenticated, user, isLoading } = useAuth();
  const { isConnected, account, formatAddress } = useBlockchain();

  const [tab, setTab] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
  });

  // Handle URL params
  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setTab(1);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.type === 'institution' ? '/dashboard' : '/wallet';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login(loginData.email, loginData.password);
      if (result.success) {
        const redirectPath = result.user.type === 'institution' ? '/dashboard' : '/wallet';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        type: signupData.userType,
      });
      
      if (result.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          const redirectPath = result.user.type === 'institution' ? '/dashboard' : '/wallet';
          navigate(redirectPath);
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome to VeriChain
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {tab === 0 
                ? 'Sign in to access your dashboard' 
                : 'Create an account to get started'}
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {/* Error/Success Messages */}
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

            {/* Connected Wallet Display */}
            {isConnected && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Wallet connected: {formatAddress(account)}
              </Alert>
            )}

            {/* Login Form */}
            {tab === 0 && (
              <form onSubmit={handleLoginSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  margin="normal"
                  required
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={loginData.rememberMe}
                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Remember me</Typography>}
                  />
                  <Link href="#" variant="body2">
                    Forgot Password?
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </form>
            )}

            {/* Sign Up Form */}
            {tab === 1 && (
              <form onSubmit={handleSignupSubmit}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  margin="normal"
                  required
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  margin="normal"
                  required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={signupData.userType}
                    label="Account Type"
                    onChange={(e) => setSignupData({ ...signupData, userType: e.target.value })}
                  >
                    <MenuItem value="user">Student / Individual</MenuItem>
                    <MenuItem value="institution">Institution</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  margin="normal"
                  required
                  helperText="Min 8 chars, 1 uppercase, 1 number, 1 special char"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Wallet Connect */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<AccountBalanceWallet />}
              onClick={() => setWalletModalOpen(true)}
              disabled={isConnected}
            >
              {isConnected ? `Connected: ${formatAddress(account)}` : 'Connect Wallet'}
            </Button>

            {/* Demo Accounts Info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Demo Accounts:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Institution: mit@institution.edu / Demo123!
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                User: alice@student.edu / Demo123!
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      <WalletConnectModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </Box>
  );
};

export default AuthPage;
