import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Grid, Link as MuiLink, IconButton, Divider } from '@mui/material';
import { GitHub, Twitter, LinkedIn, Telegram } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a1a2e',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                VeriChain
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
              Tamper-proof digital credentials on blockchain. Issue, store, and verify credentials with complete transparency and security.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
                <GitHub />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
                <LinkedIn />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}>
                <Telegram />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={RouterLink} to="/verify" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                Verify Credentials
              </MuiLink>
              <MuiLink component={RouterLink} to="/explorer" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                Block Explorer
              </MuiLink>
              <MuiLink component={RouterLink} to="/developer" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                Developer Tools
              </MuiLink>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink component={RouterLink} to="/about" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                Documentation
              </MuiLink>
              <MuiLink href="#" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                API Reference
              </MuiLink>
              <MuiLink href="#" color="inherit" underline="hover" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
                Smart Contract
              </MuiLink>
            </Box>
          </Grid>

          {/* Network */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Network Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                  }}
                />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  Polygon Amoy Testnet
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                Chain ID: 80002
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                Block Time: ~2s
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            © {new Date().getFullYear()} VeriChain. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink href="#" color="inherit" underline="hover" sx={{ color: 'grey.500', fontSize: '0.875rem' }}>
              Privacy Policy
            </MuiLink>
            <MuiLink href="#" color="inherit" underline="hover" sx={{ color: 'grey.500', fontSize: '0.875rem' }}>
              Terms of Service
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
