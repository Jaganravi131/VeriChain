import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Drawer,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add,
  History,
  Settings,
  Logout,
  Menu as MenuIcon,
  Close,
  School,
  VerifiedUser,
  HourglassEmpty,
  Send,
} from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';
import { useBlockchain } from '../state/BlockchainContext';
import { useCredentials } from '../state/CredentialContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'issue', label: 'Issue Credential', icon: <Add /> },
  { id: 'history', label: 'Credential History', icon: <History /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
];

const InstitutionDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();
  const { account, formatAddress, isDemoMode } = useBlockchain();
  const { 
    credentials, 
    credentialTypes, 
    issueCredential, 
    getCredentialsByIssuer,
    isLoading: isIssuingCredential 
  } = useCredentials();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issuanceForm, setIssuanceForm] = useState({
    recipientAddress: '',
    recipientName: '',
    credentialType: '',
    title: '',
    description: '',
    expiryDate: '',
  });

  const walletAddress = account || user?.walletAddress;
  const issuedCredentials = getCredentialsByIssuer(walletAddress);

  const stats = [
    { 
      label: 'Credentials Issued', 
      value: issuedCredentials.length, 
      icon: <School />,
      color: '#1976d2' 
    },
    { 
      label: 'Active Credentials', 
      value: issuedCredentials.filter(c => !c.isRevoked).length, 
      icon: <VerifiedUser />,
      color: '#4caf50' 
    },
    { 
      label: 'Pending Verifications', 
      value: Math.floor(Math.random() * 10), 
      icon: <HourglassEmpty />,
      color: '#ff9800' 
    },
  ];

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    
    if (!issuanceForm.recipientAddress || !issuanceForm.credentialType || !issuanceForm.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await issueCredential({
        recipientAddress: issuanceForm.recipientAddress,
        recipientName: issuanceForm.recipientName,
        credentialType: issuanceForm.credentialType,
        title: issuanceForm.title,
        description: issuanceForm.description,
        expiryDate: issuanceForm.expiryDate || null,
      });

      setIssueDialogOpen(false);
      setIssuanceForm({
        recipientAddress: '',
        recipientName: '',
        credentialType: '',
        title: '',
        description: '',
        expiryDate: '',
      });
      setActiveSection('history');
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = () => (
    <Box
      sx={{
        width: 280,
        height: '100%',
        backgroundColor: '#1a1a2e',
        color: 'white',
        p: 3,
      }}
    >
      {/* Profile */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.name}
            </Typography>
            <Chip 
              label={user?.isVerified ? 'Verified' : 'Unverified'} 
              size="small"
              color={user?.isVerified ? 'success' : 'default'}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        {walletAddress && (
          <Typography variant="caption" sx={{ color: 'grey.400' }}>
            {formatAddress(walletAddress)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'grey.800', mb: 2 }} />

      {/* Menu Items */}
      <List>
        {sidebarItems.map((item) => (
          <ListItem
            key={item.id}
            button
            selected={activeSection === item.id}
            onClick={() => {
              setActiveSection(item.id);
              setMobileDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemAvatar>
              <Box sx={{ color: activeSection === item.id ? 'white' : 'grey.400' }}>
                {item.icon}
              </Box>
            </ListItemAvatar>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: activeSection === item.id ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', pt: 4 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ 
            color: 'grey.400', 
            borderColor: 'grey.700',
            '&:hover': {
              borderColor: 'grey.500',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  const DashboardContent = () => (
    <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: `${stat.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Issue New Credential Button */}
      <Button
        variant="contained"
        size="large"
        startIcon={<Add />}
        onClick={() => setIssueDialogOpen(true)}
        sx={{ mb: 4 }}
      >
        Issue New Credential
      </Button>

      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are in demo mode. Transactions are simulated. Connect MetaMask for real blockchain transactions.
        </Alert>
      )}

      {/* Recent Activity */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        {issuedCredentials.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No credentials issued yet. Click "Issue New Credential" to get started.
          </Typography>
        ) : (
          <List>
            {issuedCredentials.slice(0, 5).map((cred) => (
              <ListItem key={cred.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <School />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={cred.title}
                  secondary={`Issued to ${formatAddress(cred.recipient)} • ${new Date(cred.issuedAt).toLocaleDateString()}`}
                />
                <Chip
                  label={cred.isRevoked ? 'Revoked' : 'Active'}
                  size="small"
                  color={cred.isRevoked ? 'error' : 'success'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </>
  );

  const HistoryContent = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Credential History
      </Typography>
      {issuedCredentials.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No credentials issued yet.
        </Typography>
      ) : (
        <List>
          {issuedCredentials.map((cred) => (
            <ListItem key={cred.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <School />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={cred.title}
                secondary={
                  <>
                    Type: {credentialTypes.find(t => t.id === cred.credentialType)?.name || cred.credentialType}
                    <br />
                    Recipient: {formatAddress(cred.recipient)}
                    <br />
                    Issued: {new Date(cred.issuedAt).toLocaleString()}
                    {cred.transactionHash && (
                      <>
                        <br />
                        Tx: {formatAddress(cred.transactionHash)}
                      </>
                    )}
                  </>
                }
              />
              <Chip
                label={cred.isRevoked ? 'Revoked' : 'Active'}
                size="small"
                color={cred.isRevoked ? 'error' : 'success'}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'issue':
        setIssueDialogOpen(true);
        setActiveSection('dashboard');
        return <DashboardContent />;
      case 'history':
        return <HistoryContent />;
      case 'settings':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Institution Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Settings panel coming soon. You can update your institution profile and preferences here.
            </Typography>
          </Paper>
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, backgroundColor: 'grey.50' }}>
        {/* Mobile Header */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              Institution Dashboard
            </Typography>
          </Box>
        )}

        <Container maxWidth="lg" disableGutters>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'history' && 'Credential History'}
            {activeSection === 'settings' && 'Settings'}
          </Typography>
          
          {renderContent()}
        </Container>
      </Box>

      {/* Issue Credential Dialog */}
      <Dialog 
        open={issueDialogOpen} 
        onClose={() => setIssueDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Issue New Credential
            </Typography>
            <IconButton onClick={() => setIssueDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleIssueSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipient Wallet Address"
                  value={issuanceForm.recipientAddress}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, recipientAddress: e.target.value })}
                  placeholder="0x..."
                  required
                  helperText="Enter the recipient's Ethereum wallet address"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipient Name (Optional)"
                  value={issuanceForm.recipientName}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, recipientName: e.target.value })}
                  placeholder="John Doe"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Credential Type</InputLabel>
                  <Select
                    value={issuanceForm.credentialType}
                    label="Credential Type"
                    onChange={(e) => setIssuanceForm({ ...issuanceForm, credentialType: e.target.value })}
                  >
                    {credentialTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiry Date (Optional)"
                  type="date"
                  value={issuanceForm.expiryDate}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, expiryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credential Title"
                  value={issuanceForm.title}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, title: e.target.value })}
                  placeholder="Bachelor of Science in Computer Science"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={issuanceForm.description}
                  onChange={(e) => setIssuanceForm({ ...issuanceForm, description: e.target.value })}
                  placeholder="Additional details about the credential..."
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isIssuingCredential ? <CircularProgress size={20} /> : <Send />}
              disabled={isIssuingCredential}
            >
              {isIssuingCredential ? 'Issuing...' : 'Issue Credential'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default InstitutionDashboard;
