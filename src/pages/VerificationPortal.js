import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Search,
  QrCodeScanner,
  VerifiedUser,
  Cancel,
  School,
  Download,
  ContentCopy,
  OpenInNew,
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import { useCredentials } from '../state/CredentialContext';
import { useBlockchain } from '../state/BlockchainContext';
import { toast } from 'react-toastify';

const VerificationPortal = () => {
  const [searchParams] = useSearchParams();
  const { verifyCredential, credentialTypes, credentials } = useCredentials();
  const { formatAddress, getExplorerUrl } = useBlockchain();

  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('id') || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a wallet address, token ID, or transaction hash');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Determine query type
      let query = {};
      if (searchQuery.startsWith('0x') && searchQuery.length === 42) {
        query = { address: searchQuery };
      } else if (searchQuery.startsWith('0x') && searchQuery.length === 66) {
        query = { hash: searchQuery };
      } else if (searchQuery.startsWith('cred-') || searchQuery.startsWith('bafybei')) {
        query = { hash: searchQuery };
      } else {
        query = { tokenId: searchQuery };
      }

      const result = await verifyCredential(query);
      setVerificationResult(result);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQRUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate QR code scanning
      toast.info('QR code scanning is simulated. Enter the credential ID manually.');
    }
  };

  const handleDownloadPDF = (credential) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Verification Certificate', 105, 25, { align: 'center' });
    
    // Verification Status
    doc.setFillColor(76, 175, 80);
    doc.roundedRect(20, 50, 170, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('✓ CREDENTIAL VERIFIED', 105, 63, { align: 'center' });
    
    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(credential.title, 105, 90, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const typeInfo = credentialTypes.find(t => t.id === credential.credentialType);
    doc.text(`Type: ${typeInfo?.name || credential.credentialType}`, 20, 110);
    doc.text(`Issued By: ${credential.issuerName}`, 20, 122);
    doc.text(`Recipient: ${formatAddress(credential.recipient)}`, 20, 134);
    doc.text(`Issue Date: ${new Date(credential.issuedAt).toLocaleDateString()}`, 20, 146);
    doc.text(`Verification Date: ${new Date().toLocaleDateString()}`, 20, 158);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Token ID: ${credential.tokenId}`, 20, 250);
    doc.text(`Transaction: ${credential.transactionHash || 'N/A'}`, 20, 258);
    doc.text('Verified by VeriChain - Blockchain-based Credential Verification', 20, 280);
    
    doc.save(`VeriChain-Verification-${credential.tokenId}.pdf`);
    toast.success('Verification certificate downloaded!');
  };

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    toast.success('Copied to clipboard!');
  };

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: 'calc(100vh - 64px)', py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Verification Portal
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Instantly verify the authenticity of any VeriChain credential using a wallet address, token ID, or transaction hash.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Verification Methods */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab icon={<Search />} label="Address/ID" iconPosition="start" />
                <Tab icon={<QrCodeScanner />} label="QR Code" iconPosition="start" />
              </Tabs>

              {/* Method 1: Address/ID Search */}
              {tab === 0 && (
                <Box>
                  <TextField
                    fullWidth
                    label="Enter Wallet Address, Token ID, or Transaction Hash"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="0x... or token ID"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={isVerifying ? <CircularProgress size={20} /> : <Search />}
                    onClick={handleVerify}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Credential'}
                  </Button>
                </Box>
              )}

              {/* Method 2: QR Code */}
              {tab === 1 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      p: 4,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'grey.50',
                      },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleQRUpload}
                    />
                    <QrCodeScanner sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Click to upload QR code image
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      or drag and drop
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Supported formats: PNG, JPG, JPEG
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Quick Demo */}
              <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Demo - Try these:
                </Typography>
                <List dense>
                  {credentials.slice(0, 3).map((cred) => (
                    <ListItemButton
                      key={cred.id}
                      onClick={() => {
                        setSearchQuery(cred.recipient);
                        setTab(0);
                      }}
                    >
                      <ListItemText
                        primary={cred.title}
                        secondary={formatAddress(cred.recipient)}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Verification Results */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Verification Result
              </Typography>

              {!verificationResult && !isVerifying && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <VerifiedUser sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Enter a credential identifier to verify
                  </Typography>
                </Box>
              )}

              {isVerifying && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CircularProgress size={64} sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Verifying credential on blockchain...
                  </Typography>
                </Box>
              )}

              {verificationResult && (
                <Box>
                  {/* Status Banner */}
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      mb: 3,
                      backgroundColor: verificationResult.isValid ? 'success.light' : 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {verificationResult.isValid ? (
                      <VerifiedUser sx={{ fontSize: 48, color: 'success.dark' }} />
                    ) : (
                      <Cancel sx={{ fontSize: 48, color: 'error.dark' }} />
                    )}
                    <Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={700}
                        color={verificationResult.isValid ? 'success.dark' : 'error.dark'}
                      >
                        {verificationResult.isValid ? 'Credential Verified' : 'Verification Failed'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {verificationResult.reason}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Credential Details */}
                  {verificationResult.credential && (
                    <Card>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                          p: 3,
                          color: 'white',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <School sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {verificationResult.credential.title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {credentialTypes.find(t => t.id === verificationResult.credential.credentialType)?.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Issued By
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {verificationResult.credential.issuerName}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Issue Date
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(verificationResult.credential.issuedAt).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Recipient
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {formatAddress(verificationResult.credential.recipient)}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleCopyHash(verificationResult.credential.recipient)}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Blockchain Details
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={`Token ID: ${verificationResult.credential.tokenId}`} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                              />
                              <Chip 
                                label={`Block: ${verificationResult.credential.blockNumber || 'N/A'}`} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }}
                              />
                            </Box>
                            {verificationResult.credential.transactionHash && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Typography variant="caption">
                                  Tx: {formatAddress(verificationResult.credential.transactionHash)}
                                </Typography>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleCopyHash(verificationResult.credential.transactionHash)}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    const url = getExplorerUrl('tx', verificationResult.credential.transactionHash);
                                    if (url) window.open(url, '_blank');
                                  }}
                                >
                                  <OpenInNew fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  {verificationResult.isValid && verificationResult.credential && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => handleDownloadPDF(verificationResult.credential)}
                      >
                        Download Certificate
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default VerificationPortal;
