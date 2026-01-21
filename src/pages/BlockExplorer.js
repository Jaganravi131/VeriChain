import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  ContentCopy,
  OpenInNew,
  CheckCircle,
  HourglassEmpty,
  Error,
  Refresh,
} from '@mui/icons-material';
import { useBlockchain } from '../state/BlockchainContext';
import { useCredentials } from '../state/CredentialContext';
import { toast } from 'react-toastify';

const BlockExplorer = () => {
  const { 
    network, 
    transactionHistory, 
    getNetworkStats, 
    formatAddress,
    getExplorerUrl,
  } = useBlockchain();
  const { credentials } = useCredentials();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [networkStats, setNetworkStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNetworkStats(getNetworkStats());
    setIsRefreshing(false);
  };

  // Combine transaction history with credential transactions
  const allTransactions = [
    ...transactionHistory,
    ...credentials.map(cred => ({
      id: cred.transactionHash || cred.id,
      hash: cred.transactionHash,
      type: 'CredentialIssued',
      status: 'confirmed',
      from: cred.issuer,
      to: cred.recipient,
      timestamp: cred.issuedAt,
      data: {
        tokenId: cred.tokenId,
        title: cred.title,
      },
      blockNumber: cred.blockNumber,
      gasUsed: Math.floor(Math.random() * 100000 + 50000).toString(),
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredTransactions = allTransactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.hash?.toLowerCase().includes(query) ||
        tx.from?.toLowerCase().includes(query) ||
        tx.to?.toLowerCase().includes(query) ||
        tx.data?.title?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'pending':
        return <HourglassEmpty sx={{ color: 'warning.main', fontSize: 20 }} />;
      case 'failed':
        return <Error sx={{ color: 'error.main', fontSize: 20 }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: 'grey.50', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Block Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore VeriChain transactions and credential issuance events on {network?.chainName || 'Polygon'}.
          </Typography>
        </Box>

        {/* Network Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Network
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {network?.chainName || 'Polygon Amoy'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'success.main',
                    }}
                  />
                  <Typography variant="caption" color="success.main">
                    Online
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Latest Block
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {networkStats?.latestBlock?.toLocaleString() || '---'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Gas Price
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {networkStats?.avgGasPrice || '30'} Gwei
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  TPS
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {networkStats?.tps || '---'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Block Time
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {networkStats?.blockTime || '2.0'}s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Congestion
                </Typography>
                <Chip
                  label={networkStats?.congestion || 'Low'}
                  size="small"
                  color={
                    networkStats?.congestion === 'High' ? 'error' :
                    networkStats?.congestion === 'Medium' ? 'warning' : 'success'
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by address, transaction hash, or credential title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filter}
                  label="Transaction Type"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All Transactions</MenuItem>
                  <MenuItem value="CredentialIssued">Credential Issuance</MenuItem>
                  <MenuItem value="CredentialRevoked">Credential Revocation</MenuItem>
                  <MenuItem value="InstitutionRegistered">Institution Registration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <IconButton onClick={refreshStats} disabled={isRefreshing}>
                <Refresh />
              </IconButton>
            </Grid>
          </Grid>
          {isRefreshing && <LinearProgress sx={{ mt: 2 }} />}
        </Paper>

        {/* Transactions Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>Status</TableCell>
                  <TableCell>Transaction Hash</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Block</TableCell>
                  <TableCell>Gas Used</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 20).map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Tooltip title={tx.status}>
                          {getStatusIcon(tx.status)}
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatAddress(tx.hash)}
                          </Typography>
                          <IconButton size="small" onClick={() => handleCopy(tx.hash)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          size="small"
                          color={
                            tx.type === 'CredentialIssued' ? 'primary' :
                            tx.type === 'CredentialRevoked' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(tx.from)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(tx.to)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tx.blockNumber?.toLocaleString() || 'Pending'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {parseInt(tx.gasUsed)?.toLocaleString() || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tx.timestamp).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const url = getExplorerUrl('tx', tx.hash);
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Contract Info */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Smart Contract
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Contract Address
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {process.env.REACT_APP_CONTRACT_ADDRESS || '0x...'}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={() => handleCopy(process.env.REACT_APP_CONTRACT_ADDRESS || '')}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Contract Name
                </Typography>
                <Typography variant="body2">
                  VeriChainCredential (SBT)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Token Standard
                </Typography>
                <Typography variant="body2">
                  ERC-721 (Soulbound)
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Credentials
                </Typography>
                <Typography variant="body2">
                  {credentials.length}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default BlockExplorer;
