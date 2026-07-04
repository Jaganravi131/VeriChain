import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Code,
  BugReport,
  PlayArrow,
  RestartAlt,
  ContentCopy,
  Download,
  Upload,
  ExpandMore,
  Terminal,
  Storage,
} from '@mui/icons-material';
import { useBlockchain } from '../state/BlockchainContext';
import { useCredentials } from '../state/CredentialContext';
import { useAuth } from '../state/AuthContext';
import { toast } from 'react-toastify';

const DeveloperTools = () => {
  const { network, account, isDemoMode, transactionHistory, formatAddress } = useBlockchain();
  const { credentials, credentialTypes } = useCredentials();
  const { getAllUsers } = useAuth();

  const [tab, setTab] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [codeInput, setCodeInput] = useState('');

  const addToConsole = (message, type = 'info') => {
    setConsoleOutput(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toISOString() 
    }]);
  };

  const clearConsole = () => {
    setConsoleOutput([]);
  };

  const handleRunCode = () => {
    if (!codeInput.trim()) {
      addToConsole('No code to execute', 'warning');
      return;
    }

    addToConsole(`> ${codeInput}`, 'command');
    
    try {
      // Safe evaluation for demo purposes
      if (codeInput.includes('credentials')) {
        addToConsole(JSON.stringify(credentials.slice(0, 2), null, 2), 'success');
      } else if (codeInput.includes('users')) {
        addToConsole(JSON.stringify(getAllUsers().slice(0, 2), null, 2), 'success');
      } else if (codeInput.includes('network')) {
        addToConsole(JSON.stringify(network, null, 2), 'success');
      } else if (codeInput.includes('account')) {
        addToConsole(account || 'No account connected', 'success');
      } else {
        addToConsole('Command not recognized. Try: credentials, users, network, account', 'warning');
      }
    } catch (error) {
      addToConsole(error.message, 'error');
    }
  };

  const handleExportState = () => {
    const state = {
      credentials,
      users: getAllUsers(),
      transactionHistory,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verichain-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('State exported successfully!');
  };

  const handleImportState = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target.result);
          // In a real app, you'd merge this with current state
          addToConsole(`Imported state from ${state.exportedAt}`, 'success');
          toast.success('State imported successfully!');
        } catch (error) {
          toast.error('Failed to parse state file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const contractABI = [
    { name: 'registerInstitution', type: 'function', inputs: ['string name', 'string description'] },
    { name: 'issueCredential', type: 'function', inputs: ['address recipient', 'string type', 'string title', 'string ipfsHash', 'uint256 expiresAt'] },
    { name: 'verifyCredential', type: 'function', inputs: ['uint256 tokenId'] },
    { name: 'revokeCredential', type: 'function', inputs: ['uint256 tokenId', 'string reason'] },
    { name: 'getCredentialsByRecipient', type: 'function', inputs: ['address recipient'] },
    { name: 'getCredentialsByIssuer', type: 'function', inputs: ['address issuer'] },
    { name: 'isInstitution', type: 'function', inputs: ['address institutionAddress'] },
    { name: 'getTotalCredentials', type: 'function', inputs: [] },
  ];

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Developer Tools
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Debug, test, and explore VeriChain's blockchain integration.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left Panel - Tools */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ overflow: 'hidden' }}>
              <Tabs 
                value={tab} 
                onChange={(e, v) => setTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
              >
                <Tab icon={<Terminal />} label="Console" iconPosition="start" />
                <Tab icon={<Code />} label="Contract ABI" iconPosition="start" />
                <Tab icon={<Storage />} label="State Viewer" iconPosition="start" />
                <Tab icon={<BugReport />} label="Debug" iconPosition="start" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {/* Console Tab */}
                {tab === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter command (try: credentials, users, network, account)"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunCode()}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            fontFamily: 'monospace',
                            backgroundColor: '#1a1a2e',
                            color: 'white',
                          }
                        }}
                      />
                      <Button variant="contained" startIcon={<PlayArrow />} onClick={handleRunCode}>
                        Run
                      </Button>
                      <Button variant="outlined" startIcon={<RestartAlt />} onClick={clearConsole}>
                        Clear
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: '#1a1a2e',
                        borderRadius: 2,
                        p: 2,
                        minHeight: 300,
                        maxHeight: 400,
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    >
                      {consoleOutput.length === 0 ? (
                        <Typography sx={{ color: 'grey.500' }}>
                          Console output will appear here...
                        </Typography>
                      ) : (
                        consoleOutput.map((log, i) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Typography
                              component="span"
                              sx={{
                                color: 
                                  log.type === 'error' ? '#f44336' :
                                  log.type === 'warning' ? '#ff9800' :
                                  log.type === 'success' ? '#4caf50' :
                                  log.type === 'command' ? '#7c4dff' : '#90caf9',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                              }}
                            >
                              {log.message}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                )}

                {/* Contract ABI Tab */}
                {tab === 1 && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      VeriChainCredential implements ERC-721 with Soulbound Token (SBT) extensions.
                    </Alert>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Function</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Parameters</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {contractABI.map((func, i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {func.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={func.type} size="small" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {func.inputs.join(', ') || 'none'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* State Viewer Tab */}
                {tab === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<Download />}
                        onClick={handleExportState}
                      >
                        Export State
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        component="label"
                      >
                        Import State
                        <input type="file" hidden accept=".json" onChange={handleImportState} />
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<RestartAlt />}
                        onClick={handleResetData}
                      >
                        Reset All Data
                      </Button>
                    </Box>

                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight={600}>Credentials ({credentials.length})</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 200,
                            fontSize: '0.75rem',
                          }}
                        >
                          {JSON.stringify(credentials.slice(0, 3), null, 2)}
                          {credentials.length > 3 && `\n... and ${credentials.length - 3} more`}
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight={600}>Users ({getAllUsers().length})</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 200,
                            fontSize: '0.75rem',
                          }}
                        >
                          {JSON.stringify(getAllUsers().slice(0, 3), null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight={600}>Credential Types</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: 'grey.100',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                          }}
                        >
                          {JSON.stringify(credentialTypes, null, 2)}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )}

                {/* Debug Tab */}
                {tab === 3 && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Wallet Status
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  backgroundColor: account ? 'success.main' : 'grey.400',
                                }}
                              />
                              <Typography variant="body2">
                                {account ? 'Connected' : 'Disconnected'}
                              </Typography>
                            </Box>
                            {account && (
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {formatAddress(account)}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Mode
                            </Typography>
                            <Chip 
                              label={isDemoMode ? 'Demo Mode' : 'Live Blockchain'}
                              color={isDemoMode ? 'warning' : 'success'}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Environment Variables
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                backgroundColor: 'grey.100',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontSize: '0.75rem',
                              }}
                            >
{`REACT_APP_CONTRACT_ADDRESS: ${process.env.REACT_APP_CONTRACT_ADDRESS || 'Not set'}
REACT_APP_DEFAULT_NETWORK: ${process.env.REACT_APP_DEFAULT_NETWORK || 'amoy'}
REACT_APP_CHAIN_ID: ${process.env.REACT_APP_CHAIN_ID || '80002'}
REACT_APP_ENABLE_DEMO_MODE: ${process.env.REACT_APP_ENABLE_DEMO_MODE || 'true'}
REACT_APP_PINATA_API_KEY: ${process.env.REACT_APP_PINATA_API_KEY ? 'Set' : 'Not set'}
REACT_APP_ALCHEMY_API_KEY: ${process.env.REACT_APP_ALCHEMY_API_KEY ? 'Set' : 'Not set'}`}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel - Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    addToConsole('Fetching network stats...', 'info');
                    addToConsole(JSON.stringify(network, null, 2), 'success');
                  }}
                >
                  Get Network Info
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    addToConsole(`Total credentials: ${credentials.length}`, 'success');
                  }}
                >
                  Count Credentials
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    addToConsole(`Total users: ${getAllUsers().length}`, 'success');
                  }}
                >
                  Count Users
                </Button>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                API Reference
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Key service methods available:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  'blockchainService.connectWallet()',
                  'blockchainService.issueCredential()',
                  'blockchainService.verifyCredential()',
                  'ipfsService.uploadMetadata()',
                  'ipfsService.getMetadata()',
                ].map((method, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1,
                      backgroundColor: 'grey.100',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {method}
                    </Typography>
                    <Tooltip title="Copy">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(method);
                          toast.success('Copied!');
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DeveloperTools;
