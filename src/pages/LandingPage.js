import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import {
  School,
  Security,
  VerifiedUser,
  Speed,
  AccountBalanceWallet,
  PlayArrow,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../state/AuthContext';
import { toast } from 'react-toastify';

const features = [
  {
    icon: <School sx={{ fontSize: 48 }} />,
    title: 'Issue Credentials',
    description: 'Institutions can issue tamper-proof digital credentials stored permanently on the blockchain.',
    color: '#1976d2',
  },
  {
    icon: <Security sx={{ fontSize: 48 }} />,
    title: 'Store Securely',
    description: 'Credentials are stored as Soulbound Tokens (SBTs) that cannot be transferred or forged.',
    color: '#7c4dff',
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 48 }} />,
    title: 'Verify Instantly',
    description: 'Anyone can verify credential authenticity in seconds using our verification portal.',
    color: '#4caf50',
  },
];

const stats = [
  { label: 'Credentials Issued', value: '10,000+' },
  { label: 'Institutions', value: '50+' },
  { label: 'Verifications', value: '100,000+' },
  { label: 'Uptime', value: '99.9%' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  const handleStartDemo = async () => {
    setIsStartingDemo(true);
    
    try {
      // Login with demo institution account
      await login('mit@institution.edu', 'Demo123!');
      toast.success('Welcome to the VeriChain demo!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to start demo. Please try again.');
    } finally {
      setIsStartingDemo(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(user?.type === 'institution' ? '/dashboard' : '/wallet');
    } else {
      navigate('/auth');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Built on Polygon"
                size="small"
                sx={{
                  backgroundColor: 'rgba(124, 77, 255, 0.2)',
                  color: '#b47cff',
                  mb: 2,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  mb: 2,
                  lineHeight: 1.2,
                }}
              >
                VeriChain: Tamper-proof Digital Credentials on Blockchain
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'grey.400',
                  mb: 4,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Issue, store, and verify academic credentials, certificates, and badges with the security and transparency of blockchain technology.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleStartDemo}
                  disabled={isStartingDemo}
                  startIcon={<PlayArrow />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    borderColor: 'grey.500',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {isStartingDemo ? 'Starting Demo...' : 'Start Demo'}
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {/* Credential Card Mockup */}
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
                    transform: 'rotate(3deg)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <School sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        MIT
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        Bachelor of Science
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Computer Science
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <VerifiedUser sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      Verified on Blockchain
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 4, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            How VeriChain Works
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            A complete ecosystem for issuing, managing, and verifying digital credentials on the blockchain.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Technology Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Powered by Blockchain Technology
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                VeriChain leverages the Polygon blockchain for fast, low-cost, and environmentally friendly transactions. Credentials are minted as Soulbound Tokens (SBTs) - non-transferable NFTs that represent authentic achievements.
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Speed sx={{ color: 'primary.main' }} />
                  <Typography variant="body2">~2 second transaction finality</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceWallet sx={{ color: 'primary.main' }} />
                  <Typography variant="body2">MetaMask & WalletConnect support</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Security sx={{ color: 'primary.main' }} />
                  <Typography variant="body2">Cryptographically secured credentials</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="overline" color="grey.400">
                  Smart Contract
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  VeriChainCredential.sol
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    p: 2,
                    borderRadius: 2,
                    overflow: 'auto',
                    fontSize: '0.75rem',
                  }}
                >
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeriChainCredential {
    // Soulbound Token (SBT)
    // Non-transferable credentials
    
    function issueCredential(
        address recipient,
        string memory title,
        string memory ipfsHash
    ) external returns (uint256);
    
    function verifyCredential(
        uint256 tokenId
    ) external view returns (bool);
}`}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Join institutions and individuals who trust VeriChain for secure credential management.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/auth?tab=signup')}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Create Account
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/verify')}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Verify a Credential
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
