import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
  Wallet,
  VerifiedUser,
  Info,
  Home,
  Code,
  Explore,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { useAuth } from '../../state/AuthContext';
import { useBlockchain } from '../../state/BlockchainContext';
import WalletConnectModal from '../wallet/WalletConnectModal';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, account, balance, formatAddress, disconnectWallet } = useBlockchain();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    disconnectWallet();
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate(user?.type === 'institution' ? '/dashboard' : '/wallet');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Verify', path: '/verify', icon: <VerifiedUser /> },
    { label: 'Explorer', path: '/explorer', icon: <Explore /> },
    { label: 'Developer', path: '/developer', icon: <Code /> },
    { label: 'About', path: '/about', icon: <Info /> },
  ];

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                V
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              VeriChain
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  color="inherit"
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Wallet Status */}
            {isConnected ? (
              <Tooltip title={`Balance: ${balance} MATIC`}>
                <Chip
                  icon={<AccountBalanceWallet />}
                  label={formatAddress(account)}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AccountBalanceWallet />}
                onClick={() => setWalletModalOpen(true)}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                Connect Wallet
              </Button>
            )}

            {/* Auth Buttons / User Menu */}
            {isAuthenticated ? (
              <>
                <Tooltip title="Account">
                  <IconButton onClick={handleProfileClick}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleDashboard}>
                    <ListItemIcon>
                      {user?.type === 'institution' ? <Dashboard fontSize="small" /> : <Wallet fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>
                      {user?.type === 'institution' ? 'Dashboard' : 'My Wallet'}
                    </ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  component={Link}
                  to="/auth"
                  variant="text"
                  color="inherit"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/auth?tab=signup"
                  variant="contained"
                  color="primary"
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton onClick={() => setMobileDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawer}
        onClose={() => setMobileDrawer(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem 
                key={link.path}
                button 
                component={Link} 
                to={link.path}
                onClick={() => setMobileDrawer(false)}
              >
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
            
            {!isAuthenticated && (
              <>
                <ListItem 
                  button 
                  component={Link} 
                  to="/auth"
                  onClick={() => setMobileDrawer(false)}
                >
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem 
                  button 
                  component={Link} 
                  to="/auth?tab=signup"
                  onClick={() => setMobileDrawer(false)}
                >
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Sign Up" />
                </ListItem>
              </>
            )}

            {isAuthenticated && (
              <>
                <ListItem button onClick={handleDashboard}>
                  <ListItemIcon>
                    {user?.type === 'institution' ? <Dashboard /> : <Wallet />}
                  </ListItemIcon>
                  <ListItemText primary={user?.type === 'institution' ? 'Dashboard' : 'My Wallet'} />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
