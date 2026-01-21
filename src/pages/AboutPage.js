import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Security,
  Verified,
  Speed,
  Language,
  Lock,
  CloudUpload,
  AccountBalance,
  Person,
  School,
  Business,
  CheckCircle,
  Code,
  Storage,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const AboutPage = () => {
  const features = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Blockchain Security',
      description: 'All credentials are stored on the Polygon blockchain, ensuring tamper-proof verification and permanent records.',
    },
    {
      icon: <Verified sx={{ fontSize: 40 }} />,
      title: 'Instant Verification',
      description: 'Verify any credential in seconds using the credential ID or QR code, without contacting the issuing institution.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast & Low Cost',
      description: 'Built on Polygon for fast transactions and minimal gas fees, making credential issuance affordable for everyone.',
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: 'Global Access',
      description: 'Access and verify credentials from anywhere in the world, 24/7, without geographical restrictions.',
    },
  ];

  const howItWorks = [
    {
      title: 'Institution Registration',
      description: 'Educational institutions and organizations register on VeriChain and verify their identity through our verification process.',
    },
    {
      title: 'Credential Issuance',
      description: 'Verified institutions issue credentials to recipients. The credential metadata is stored on IPFS, and the hash is recorded on the blockchain.',
    },
    {
      title: 'Wallet Storage',
      description: 'Recipients receive credentials as Soulbound Tokens (SBTs) in their digital wallet, permanently linked to their blockchain address.',
    },
    {
      title: 'Instant Verification',
      description: 'Employers or third parties can verify credentials instantly by entering the credential ID or scanning the QR code.',
    },
  ];

  const techStack = [
    { name: 'React', category: 'Frontend' },
    { name: 'Material-UI', category: 'UI Framework' },
    { name: 'Solidity', category: 'Smart Contract' },
    { name: 'OpenZeppelin', category: 'Security' },
    { name: 'ethers.js', category: 'Web3' },
    { name: 'Polygon', category: 'Blockchain' },
    { name: 'IPFS/Pinata', category: 'Storage' },
    { name: 'Hardhat', category: 'Development' },
  ];

  const userTypes = [
    {
      icon: <AccountBalance />,
      title: 'Institutions',
      description: 'Universities, certification bodies, and organizations that issue credentials.',
      features: ['Register and verify identity', 'Issue credentials', 'Manage credential history', 'Revoke if needed'],
    },
    {
      icon: <Person />,
      title: 'Individuals',
      description: 'Students, professionals, and anyone receiving credentials.',
      features: ['Store credentials securely', 'Share with employers', 'Generate verifiable QR codes', 'Download certificates'],
    },
    {
      icon: <Business />,
      title: 'Employers',
      description: 'Companies and organizations verifying candidate credentials.',
      features: ['Instant verification', 'No contact with issuers needed', 'Check credential authenticity', 'View full credential details'],
    },
  ];

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #7c4dff 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={700} gutterBottom textAlign="center">
            About VeriChain
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ maxWidth: 700, mx: 'auto', opacity: 0.9 }}>
            Revolutionizing credential verification through blockchain technology. 
            Secure, instant, and globally accessible.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Mission Section */}
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            VeriChain aims to eliminate credential fraud and simplify verification processes worldwide. 
            By leveraging blockchain technology, we create an immutable record of academic and professional 
            credentials that can be verified instantly by anyone, anywhere.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Our Soulbound Token (SBT) implementation ensures that credentials are permanently tied to their 
            rightful owners and cannot be transferred or forged, providing the highest level of trust and security.
          </Typography>
        </Paper>

        {/* Features Grid */}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Key Features
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
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

        {/* How It Works */}
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            How It Works
          </Typography>
          <Stepper orientation="vertical">
            {howItWorks.map((step, index) => (
              <Step key={index} active>
                <StepLabel>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.title}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* User Types */}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          Who Uses VeriChain?
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {userTypes.map((userType, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ backgroundColor: 'primary.main' }}>
                      {userType.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      {userType.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {userType.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {userType.features.map((feature, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Technology Stack */}
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Technology Stack
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            VeriChain is built with modern, industry-standard technologies:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {techStack.map((tech, index) => (
              <Chip
                key={index}
                label={`${tech.name} (${tech.category})`}
                variant="outlined"
                icon={tech.category === 'Frontend' ? <Code /> : 
                      tech.category === 'Blockchain' ? <LinkIcon /> : 
                      tech.category === 'Storage' ? <Storage /> : 
                      <Lock />}
              />
            ))}
          </Box>
        </Paper>

        {/* Architecture Overview */}
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Architecture Overview
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Code sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Smart Contract Layer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  VeriChainCredential.sol implements ERC-721 with SBT extensions. 
                  Handles credential issuance, verification, and revocation with role-based access control.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Storage sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Storage Layer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Credential metadata is stored on IPFS via Pinata for decentralized, 
                  permanent storage. Only the IPFS hash is stored on-chain for efficiency.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Application Layer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  React frontend with ethers.js for blockchain interaction. 
                  MetaMask integration for wallet connection and transaction signing.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a237e 0%, #7c4dff 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Experience the future of credential verification today.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              component={RouterLink}
              to="/auth"
              startIcon={<School />}
            >
              Register as Institution
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              component={RouterLink}
              to="/verify"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              startIcon={<Verified />}
            >
              Verify a Credential
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutPage;
