/**
 * Blockchain Service - Real Web3 Integration
 * Handles MetaMask connection, transaction signing, and smart contract interactions
 */

import { ethers } from 'ethers';

// Network configurations
export const NETWORKS = {
  amoy: {
    chainId: '0x13882', // 80002 in hex
    chainIdDecimal: 80002,
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      process.env.REACT_APP_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
    ],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainIdDecimal: 80001,
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      process.env.REACT_APP_POLYGON_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
    ],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
  polygon: {
    chainId: '0x89', // 137 in hex
    chainIdDecimal: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [
      process.env.REACT_APP_POLYGON_MAINNET_RPC || 'https://polygon-rpc.com',
    ],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  localhost: {
    chainId: '0x539', // 1337 in hex
    chainIdDecimal: 1337,
    chainName: 'Localhost',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
};

// Get default network from environment
const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK || 'amoy';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.network = NETWORKS[DEFAULT_NETWORK];
    this.isConnected = false;
    this.account = null;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];
      this.isConnected = true;

      // Check and switch network if needed
      await this.checkAndSwitchNetwork();

      // Initialize contract if address is set
      if (this.contractAddress) {
        await this.initializeContract();
      }

      // Set up event listeners
      this.setupEventListeners();

      return {
        success: true,
        account: this.account,
        network: this.network,
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
    this.account = null;
  }

  /**
   * Check current network and switch if needed
   */
  async checkAndSwitchNetwork() {
    if (!window.ethereum) return;

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== this.network.chainId) {
      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.network.chainId }],
        });
      } catch (switchError) {
        // If the network is not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [this.network],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  /**
   * Set up MetaMask event listeners
   */
  setupEventListeners() {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
      } else {
        this.account = accounts[0];
        window.dispatchEvent(new CustomEvent('accountChanged', { detail: accounts[0] }));
      }
    });

    window.ethereum.on('chainChanged', (chainId) => {
      window.dispatchEvent(new CustomEvent('chainChanged', { detail: chainId }));
      window.location.reload();
    });
  }

  /**
   * Initialize the smart contract
   */
  async initializeContract() {
    if (!this.contractAddress) {
      console.warn('Contract address not set');
      return;
    }

    // Import contract ABI
    const contractABI = await this.getContractABI();
    
    if (contractABI && this.signer) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.signer
      );
    }
  }

  /**
   * Get contract ABI
   */
  async getContractABI() {
    try {
      const artifact = await import('../artifacts/contracts/VeriChainCredential.sol/VeriChainCredential.json');
      return artifact.abi;
    } catch (error) {
      console.error('Failed to load contract ABI:', error);
      // Return minimal ABI for basic functionality
      return this.getMinimalABI();
    }
  }

  /**
   * Minimal ABI for basic operations
   */
  getMinimalABI() {
    return [
      "function registerInstitution(string name, string description) external",
      "function issueCredential(address recipient, string credentialType, string title, string ipfsHash, uint256 expiresAt) external returns (uint256)",
      "function verifyCredential(uint256 tokenId) external returns (bool isValid, tuple(uint256 tokenId, address issuer, address recipient, string credentialType, string title, string ipfsHash, uint256 issuedAt, uint256 expiresAt, bool isRevoked, bytes32 credentialHash) credential)",
      "function revokeCredential(uint256 tokenId, string reason) external",
      "function getCredentialsByRecipient(address recipient) external view returns (uint256[])",
      "function getCredentialsByIssuer(address issuer) external view returns (uint256[])",
      "function credentials(uint256 tokenId) external view returns (uint256, address, address, string, string, string, uint256, uint256, bool, bytes32)",
      "function institutions(address) external view returns (string name, string description, address walletAddress, bool isVerified, uint256 registeredAt, uint256 credentialsIssued)",
      "function isInstitution(address institutionAddress) external view returns (bool)",
      "function getTotalCredentials() external view returns (uint256)",
      "event CredentialIssued(uint256 indexed tokenId, address indexed issuer, address indexed recipient, string credentialType, string title, string ipfsHash, uint256 timestamp)",
      "event CredentialRevoked(uint256 indexed tokenId, address indexed revoker, string reason, uint256 timestamp)",
      "event InstitutionRegistered(address indexed institution, string name, uint256 timestamp)"
    ];
  }

  /**
   * Get account balance
   */
  async getBalance() {
    if (!this.provider || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    const balance = await this.provider.getBalance(this.account);
    return ethers.formatEther(balance);
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null,
    };
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(method, ...args) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      const gasEstimate = await this.contract[method].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw error;
    }
  }

  /**
   * Register institution on blockchain
   */
  async registerInstitution(name, description) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.registerInstitution(name, description);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Institution registration failed:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Issue a credential on blockchain
   */
  async issueCredential(recipient, credentialType, title, ipfsHash, expiresAt = 0) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.issueCredential(
        recipient,
        credentialType,
        title,
        ipfsHash,
        expiresAt
      );
      
      const receipt = await tx.wait();
      
      // Parse the CredentialIssued event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'CredentialIssued';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsedEvent = this.contract.interface.parseLog(event);
        tokenId = parsedEvent.args.tokenId.toString();
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Credential issuance failed:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Verify a credential on blockchain
   */
  async verifyCredential(tokenId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Use staticCall for read-only verification
      const result = await this.contract.verifyCredential.staticCall(tokenId);
      
      return {
        isValid: result[0],
        credential: {
          tokenId: result[1].tokenId?.toString(),
          issuer: result[1].issuer,
          recipient: result[1].recipient,
          credentialType: result[1].credentialType,
          title: result[1].title,
          ipfsHash: result[1].ipfsHash,
          issuedAt: new Date(Number(result[1].issuedAt) * 1000).toISOString(),
          expiresAt: result[1].expiresAt > 0 ? new Date(Number(result[1].expiresAt) * 1000).toISOString() : null,
          isRevoked: result[1].isRevoked,
          credentialHash: result[1].credentialHash,
        },
      };
    } catch (error) {
      console.error('Credential verification failed:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Revoke a credential
   */
  async revokeCredential(tokenId, reason) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.revokeCredential(tokenId, reason);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Credential revocation failed:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Get credentials by recipient address
   */
  async getCredentialsByRecipient(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokenIds = await this.contract.getCredentialsByRecipient(address);
      const credentials = [];

      for (const tokenId of tokenIds) {
        const cred = await this.contract.credentials(tokenId);
        credentials.push({
          tokenId: cred[0].toString(),
          issuer: cred[1],
          recipient: cred[2],
          credentialType: cred[3],
          title: cred[4],
          ipfsHash: cred[5],
          issuedAt: new Date(Number(cred[6]) * 1000).toISOString(),
          expiresAt: cred[7] > 0 ? new Date(Number(cred[7]) * 1000).toISOString() : null,
          isRevoked: cred[8],
          credentialHash: cred[9],
        });
      }

      return credentials;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Get credentials issued by an institution
   */
  async getCredentialsByIssuer(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokenIds = await this.contract.getCredentialsByIssuer(address);
      const credentials = [];

      for (const tokenId of tokenIds) {
        const cred = await this.contract.credentials(tokenId);
        credentials.push({
          tokenId: cred[0].toString(),
          issuer: cred[1],
          recipient: cred[2],
          credentialType: cred[3],
          title: cred[4],
          ipfsHash: cred[5],
          issuedAt: new Date(Number(cred[6]) * 1000).toISOString(),
          expiresAt: cred[7] > 0 ? new Date(Number(cred[7]) * 1000).toISOString() : null,
          isRevoked: cred[8],
          credentialHash: cred[9],
        });
      }

      return credentials;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Get institution details
   */
  async getInstitution(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const inst = await this.contract.institutions(address);
      return {
        name: inst[0],
        description: inst[1],
        walletAddress: inst[2],
        isVerified: inst[3],
        registeredAt: new Date(Number(inst[4]) * 1000).toISOString(),
        credentialsIssued: inst[5].toString(),
      };
    } catch (error) {
      console.error('Failed to get institution:', error);
      throw this.parseContractError(error);
    }
  }

  /**
   * Check if address is a registered institution
   */
  async isInstitution(address) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.isInstitution(address);
    } catch (error) {
      console.error('Failed to check institution status:', error);
      return false;
    }
  }

  /**
   * Get total credentials issued
   */
  async getTotalCredentials() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const total = await this.contract.getTotalCredentials();
      return total.toString();
    } catch (error) {
      console.error('Failed to get total credentials:', error);
      return '0';
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Parse contract errors into readable messages
   */
  parseContractError(error) {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('user rejected')) {
      return new Error('Transaction was rejected by user');
    }
    if (errorMessage.includes('insufficient funds')) {
      return new Error('Insufficient MATIC balance for transaction');
    }
    if (errorMessage.includes('SoulboundTokenCannotBeTransferred')) {
      return new Error('Credentials are soulbound and cannot be transferred');
    }
    if (errorMessage.includes('InstitutionNotRegistered')) {
      return new Error('Institution is not registered');
    }
    if (errorMessage.includes('CredentialNotFound')) {
      return new Error('Credential not found');
    }
    if (errorMessage.includes('CredentialAlreadyRevoked')) {
      return new Error('Credential has already been revoked');
    }
    if (errorMessage.includes('InvalidRecipientAddress')) {
      return new Error('Invalid recipient address');
    }
    
    return error;
  }

  /**
   * Format address for display
   */
  formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Get block explorer URL for transaction
   */
  getExplorerTxUrl(txHash) {
    const baseUrl = this.network.blockExplorerUrls[0];
    return baseUrl ? `${baseUrl}tx/${txHash}` : null;
  }

  /**
   * Get block explorer URL for address
   */
  getExplorerAddressUrl(address) {
    const baseUrl = this.network.blockExplorerUrls[0];
    return baseUrl ? `${baseUrl}address/${address}` : null;
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
