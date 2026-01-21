import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import blockchainService, { NETWORKS } from '../services/blockchainService';
import { toast } from 'react-toastify';

const BlockchainContext = createContext(null);

export const BlockchainProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [gasPrice, setGasPrice] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load transaction history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('verichain_tx_history');
    if (history) {
      setTransactionHistory(JSON.parse(history));
    }
  }, []);

  // Save transaction history to localStorage
  useEffect(() => {
    if (transactionHistory.length > 0) {
      localStorage.setItem('verichain_tx_history', JSON.stringify(transactionHistory));
    }
  }, [transactionHistory]);

  // Fetch gas price periodically when connected
  useEffect(() => {
    if (isConnected && !isDemoMode) {
      fetchGasPrice();
      const interval = setInterval(fetchGasPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, isDemoMode]);

  // Listen for wallet events
  useEffect(() => {
    const handleAccountChanged = (event) => {
      setAccount(event.detail);
      updateBalance();
    };

    const handleDisconnected = () => {
      disconnectWallet();
    };

    window.addEventListener('accountChanged', handleAccountChanged);
    window.addEventListener('walletDisconnected', handleDisconnected);

    return () => {
      window.removeEventListener('accountChanged', handleAccountChanged);
      window.removeEventListener('walletDisconnected', handleDisconnected);
    };
  }, []);

  const fetchGasPrice = async () => {
    try {
      const price = await blockchainService.getGasPrice();
      setGasPrice(price);
    } catch (err) {
      console.error('Failed to fetch gas price:', err);
    }
  };

  const updateBalance = async () => {
    try {
      const bal = await blockchainService.getBalance();
      setBalance(bal);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const connectWallet = useCallback(async (provider = 'metamask') => {
    setIsConnecting(true);
    setError(null);

    try {
      if (provider === 'metamask') {
        if (!blockchainService.isMetaMaskInstalled()) {
          throw new Error('MetaMask is not installed. Please install MetaMask extension.');
        }

        const result = await blockchainService.connectWallet();
        
        setAccount(result.account);
        setNetwork(result.network);
        setIsConnected(true);
        setIsDemoMode(false);
        
        await updateBalance();
        
        toast.success(`Wallet connected: ${blockchainService.formatAddress(result.account)}`);
        
        return result;
      } else {
        // For other providers, use demo mode
        const demoAddress = generateDemoAddress();
        setAccount(demoAddress);
        setNetwork(NETWORKS.amoy);
        setIsConnected(true);
        setIsDemoMode(true);
        setBalance('100.0');
        
        toast.info(`Connected in demo mode: ${blockchainService.formatAddress(demoAddress)}`);
        
        return { success: true, account: demoAddress, isDemo: true };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    blockchainService.disconnectWallet();
    setIsConnected(false);
    setAccount(null);
    setBalance(null);
    setNetwork(null);
    setIsDemoMode(false);
    setGasPrice(null);
    toast.info('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async (networkName) => {
    const targetNetwork = NETWORKS[networkName];
    
    try {
      if (!targetNetwork) {
        throw new Error('Invalid network');
      }

      if (!isDemoMode) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetNetwork.chainId }],
        });
      }
      
      setNetwork(targetNetwork);
      toast.success(`Switched to ${targetNetwork.chainName}`);
    } catch (err) {
      if (err.code === 4902 && targetNetwork) {
        // Network not added, try to add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });
          setNetwork(targetNetwork);
        } catch (addError) {
          toast.error('Failed to add network');
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  }, [isDemoMode]);

  const addTransaction = useCallback((tx) => {
    const transaction = {
      ...tx,
      id: tx.hash || `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setPendingTransactions(prev => [...prev, transaction]);
    
    return transaction;
  }, []);

  const updateTransactionStatus = useCallback((txId, status, receipt = null) => {
    setPendingTransactions(prev => 
      prev.map(tx => 
        tx.id === txId ? { ...tx, status, receipt } : tx
      )
    );

    if (status === 'confirmed' || status === 'failed') {
      setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
      
      setTransactionHistory(prev => {
        const tx = prev.find(t => t.id === txId) || 
          pendingTransactions.find(t => t.id === txId);
        if (tx) {
          return [{ ...tx, status, receipt, completedAt: new Date().toISOString() }, ...prev];
        }
        return prev;
      });
    }
  }, [pendingTransactions]);

  const simulateTransaction = useCallback(async (type, data) => {
    // For demo mode, simulate transaction processing
    const txId = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    const tx = addTransaction({
      hash: txId,
      type,
      data,
      status: 'pending',
      from: account,
      network: network?.chainName,
    });

    // Simulate confirmation delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;
    const gasUsed = Math.floor(Math.random() * 100000) + 50000;

    const receipt = {
      blockNumber,
      gasUsed: gasUsed.toString(),
      status: 1,
      confirmations: Math.floor(Math.random() * 10) + 1,
    };

    updateTransactionStatus(tx.id, 'confirmed', receipt);

    return {
      success: true,
      transactionHash: txId,
      blockNumber,
      gasUsed: gasUsed.toString(),
    };
  }, [account, network, addTransaction, updateTransactionStatus]);

  const generateDemoAddress = () => {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const formatAddress = (address) => {
    return blockchainService.formatAddress(address);
  };

  const getExplorerUrl = (type, hash) => {
    if (!network?.blockExplorerUrls?.[0]) return null;
    const baseUrl = network.blockExplorerUrls[0];
    return type === 'tx' 
      ? `${baseUrl}tx/${hash}`
      : `${baseUrl}address/${hash}`;
  };

  const getNetworkStats = useCallback(() => {
    // Generate simulated network stats
    return {
      tps: Math.floor(Math.random() * 50) + 30,
      blockTime: (2 + Math.random()).toFixed(1),
      avgGasPrice: gasPrice?.gasPrice || '30',
      congestion: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      latestBlock: Math.floor(Math.random() * 1000000) + 50000000,
    };
  }, [gasPrice]);

  const value = {
    isConnected,
    account,
    balance,
    network,
    isConnecting,
    gasPrice,
    pendingTransactions,
    transactionHistory,
    error,
    isDemoMode,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addTransaction,
    updateTransactionStatus,
    simulateTransaction,
    formatAddress,
    getExplorerUrl,
    getNetworkStats,
    networks: NETWORKS,
    service: blockchainService,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export default BlockchainContext;
