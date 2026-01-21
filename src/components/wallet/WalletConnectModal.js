import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useBlockchain } from '../../state/BlockchainContext';
import { useAuth } from '../../state/AuthContext';

// Wallet provider configurations
const WALLET_PROVIDERS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    description: 'Connect using MetaMask browser extension',
    icon: '🦊',
    color: '#F6851B',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    description: 'Connect using WalletConnect protocol',
    icon: '🔗',
    color: '#3B99FC',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    description: 'Connect using Coinbase Wallet',
    icon: '💰',
    color: '#0052FF',
  },
];

const WalletConnectModal = ({ open, onClose }) => {
  const { connectWallet, isConnecting, error: blockchainError } = useBlockchain();
  const { updateWalletAddress } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async (providerId) => {
    setSelectedProvider(providerId);
    setError(null);

    try {
      const result = await connectWallet(providerId);
      
      // Update user's wallet address
      if (result.account) {
        await updateWalletAddress(result.account);
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setSelectedProvider(null);
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      setError(null);
      setSelectedProvider(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Connect Wallet
        </Typography>
        <IconButton onClick={handleClose} disabled={isConnecting}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a wallet provider to connect to VeriChain. Your wallet will be used to sign transactions and verify your identity.
        </Typography>

        {(error || blockchainError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || blockchainError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {WALLET_PROVIDERS.map((provider) => (
            <Paper
              key={provider.id}
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: selectedProvider === provider.id ? 'primary.main' : 'grey.200',
                borderRadius: 2,
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: isConnecting ? 'grey.200' : 'primary.main',
                  backgroundColor: isConnecting ? 'transparent' : 'grey.50',
                },
              }}
              onClick={() => !isConnecting && handleConnect(provider.id)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: `${provider.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  {provider.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {provider.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {provider.description}
                  </Typography>
                </Box>
                {selectedProvider === provider.id && isConnecting ? (
                  <CircularProgress size={24} />
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isConnecting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(provider.id);
                    }}
                  >
                    Connect
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> For the best experience, ensure you have the wallet extension installed. MetaMask connects to Polygon Amoy Testnet for real blockchain transactions. Other wallets use demo mode.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            New to wallets?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1976d2' }}
            >
              Get MetaMask
            </a>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
