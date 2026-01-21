import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBlockchain } from './BlockchainContext';
import { useAuth } from './AuthContext';
import ipfsService from '../services/ipfsService';
import { toast } from 'react-toastify';

const CredentialContext = createContext(null);

const STORAGE_KEYS = {
  CREDENTIALS: 'verichain_credentials',
  VERIFICATIONS: 'verichain_verifications',
};

// Credential types
export const CREDENTIAL_TYPES = [
  { id: 'degree', name: 'Academic Degree', icon: '🎓' },
  { id: 'certificate', name: 'Professional Certificate', icon: '📜' },
  { id: 'course', name: 'Course Completion', icon: '📚' },
  { id: 'badge', name: 'Achievement Badge', icon: '🏆' },
  { id: 'license', name: 'Professional License', icon: '📋' },
  { id: 'membership', name: 'Membership', icon: '🎫' },
];

// Default demo credentials
const DEFAULT_CREDENTIALS = [
  {
    id: 'cred-1',
    tokenId: '1',
    issuer: '0x1234567890123456789012345678901234567890',
    issuerName: 'Massachusetts Institute of Technology',
    recipient: '0x4567890123456789012345678901234567890123',
    recipientName: 'Alice Johnson',
    credentialType: 'degree',
    title: 'Bachelor of Science in Computer Science',
    description: 'Awarded for successful completion of the undergraduate program in Computer Science with honors.',
    ipfsHash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    issuedAt: '2024-05-15T10:00:00.000Z',
    expiresAt: null,
    isRevoked: false,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 50000001,
  },
  {
    id: 'cred-2',
    tokenId: '2',
    issuer: '0x2345678901234567890123456789012345678901',
    issuerName: 'Stanford University',
    recipient: '0x4567890123456789012345678901234567890123',
    recipientName: 'Alice Johnson',
    credentialType: 'certificate',
    title: 'Machine Learning Specialization',
    description: 'Professional certificate in Machine Learning and Artificial Intelligence.',
    ipfsHash: 'bafybeihkoviema7g3gxyt6la7vd5ho32ictqbelu3ber27pzzla3zrkf5m',
    issuedAt: '2024-08-20T14:30:00.000Z',
    expiresAt: '2027-08-20T14:30:00.000Z',
    isRevoked: false,
    transactionHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    blockNumber: 50000100,
  },
  {
    id: 'cred-3',
    tokenId: '3',
    issuer: '0x3456789012345678901234567890123456789012',
    issuerName: 'Coursera',
    recipient: '0x5678901234567890123456789012345678901234',
    recipientName: 'Bob Smith',
    credentialType: 'course',
    title: 'Full Stack Web Development',
    description: 'Completed comprehensive course on modern web development technologies.',
    ipfsHash: 'bafybeibwzifw52ttrkqlikfzext5akxu7lz4xiwjgwzmqcpdzmp3n5vnbe',
    issuedAt: '2024-09-10T09:00:00.000Z',
    expiresAt: null,
    isRevoked: false,
    transactionHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    blockNumber: 50000200,
  },
  {
    id: 'cred-4',
    tokenId: '4',
    issuer: '0x1234567890123456789012345678901234567890',
    issuerName: 'Massachusetts Institute of Technology',
    recipient: '0x6789012345678901234567890123456789012345',
    recipientName: 'Carol Williams',
    credentialType: 'degree',
    title: 'Master of Science in Data Science',
    description: 'Graduate degree in Data Science with focus on statistical modeling.',
    ipfsHash: 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
    issuedAt: '2024-06-01T11:00:00.000Z',
    expiresAt: null,
    isRevoked: false,
    transactionHash: '0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef',
    blockNumber: 50000050,
  },
  {
    id: 'cred-5',
    tokenId: '5',
    issuer: '0x2345678901234567890123456789012345678901',
    issuerName: 'Stanford University',
    recipient: '0x7890123456789012345678901234567890123456',
    recipientName: 'David Brown',
    credentialType: 'badge',
    title: 'AI Ethics Champion',
    description: 'Recognition for outstanding contributions to AI ethics research.',
    ipfsHash: 'bafybeigvgzoolc3drupxhlevdp2ugqcni3z3e7swr5aiheuqcximzcptza',
    issuedAt: '2024-10-05T16:00:00.000Z',
    expiresAt: null,
    isRevoked: false,
    transactionHash: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
    blockNumber: 50000300,
  },
];

export const CredentialProvider = ({ children }) => {
  const [credentials, setCredentials] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  
  const { account, isDemoMode, simulateTransaction, service } = useBlockchain();
  const { user } = useAuth();

  // Initialize credentials from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (stored) {
      setCredentials(JSON.parse(stored));
    } else {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(DEFAULT_CREDENTIALS));
      setCredentials(DEFAULT_CREDENTIALS);
    }

    const storedVerifications = localStorage.getItem(STORAGE_KEYS.VERIFICATIONS);
    if (storedVerifications) {
      setVerifications(JSON.parse(storedVerifications));
    }
  }, []);

  // Save credentials to localStorage
  useEffect(() => {
    if (credentials.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    }
  }, [credentials]);

  // Save verifications to localStorage
  useEffect(() => {
    if (verifications.length > 0) {
      localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifications));
    }
  }, [verifications]);

  const issueCredential = useCallback(async (credentialData) => {
    setIsLoading(true);
    
    try {
      const {
        recipientAddress,
        credentialType,
        title,
        description,
        expiryDate,
      } = credentialData;

      // Create metadata for IPFS
      const metadata = ipfsService.createCredentialMetadata({
        title,
        description,
        credentialType,
        issuer: account || user?.walletAddress,
        issuerName: user?.name,
        recipient: recipientAddress,
        issueDate: new Date().toISOString(),
        expiryDate: expiryDate || null,
      });

      // Upload to IPFS
      const ipfsResult = await ipfsService.uploadMetadata(metadata);
      
      let transactionResult;
      
      if (isDemoMode || !service.contract) {
        // Demo mode: simulate transaction
        transactionResult = await simulateTransaction('issueCredential', {
          recipient: recipientAddress,
          credentialType,
          title,
        });
      } else {
        // Real blockchain transaction
        transactionResult = await service.issueCredential(
          recipientAddress,
          credentialType,
          title,
          ipfsResult.ipfsHash,
          expiryDate ? Math.floor(new Date(expiryDate).getTime() / 1000) : 0
        );
      }

      // Create local credential record
      const newCredential = {
        id: uuidv4(),
        tokenId: transactionResult.tokenId || credentials.length + 1,
        issuer: account || user?.walletAddress,
        issuerName: user?.name,
        recipient: recipientAddress,
        recipientName: credentialData.recipientName || 'Unknown',
        credentialType,
        title,
        description,
        ipfsHash: ipfsResult.ipfsHash,
        issuedAt: new Date().toISOString(),
        expiresAt: expiryDate || null,
        isRevoked: false,
        transactionHash: transactionResult.transactionHash,
        blockNumber: transactionResult.blockNumber,
      };

      setCredentials(prev => [...prev, newCredential]);
      
      toast.success('Credential issued successfully!');
      
      return { success: true, credential: newCredential, transaction: transactionResult };
    } catch (error) {
      console.error('Failed to issue credential:', error);
      toast.error(error.message || 'Failed to issue credential');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [account, user, isDemoMode, simulateTransaction, service, credentials.length]);

  const verifyCredential = useCallback(async (query) => {
    setIsLoading(true);
    
    try {
      let credentialToVerify = null;
      
      // Search by tokenId, hash, or address
      if (query.tokenId) {
        credentialToVerify = credentials.find(c => c.tokenId === query.tokenId);
      } else if (query.hash) {
        credentialToVerify = credentials.find(c => 
          c.transactionHash?.toLowerCase() === query.hash.toLowerCase() ||
          c.ipfsHash?.toLowerCase() === query.hash.toLowerCase()
        );
      } else if (query.address) {
        credentialToVerify = credentials.find(c => 
          c.recipient?.toLowerCase() === query.address.toLowerCase()
        );
      }

      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const verificationResult = {
        id: uuidv4(),
        query,
        timestamp: new Date().toISOString(),
        verifier: account || 'anonymous',
        isValid: !!credentialToVerify && !credentialToVerify.isRevoked,
        credential: credentialToVerify,
        reason: credentialToVerify 
          ? (credentialToVerify.isRevoked ? 'Credential has been revoked' : 'Credential is valid')
          : 'Credential not found',
      };

      setVerifications(prev => [verificationResult, ...prev]);
      
      return verificationResult;
    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [credentials, account]);

  const revokeCredential = useCallback(async (tokenId, reason) => {
    setIsLoading(true);
    
    try {
      if (!isDemoMode && service.contract) {
        await service.revokeCredential(tokenId, reason);
      } else {
        await simulateTransaction('revokeCredential', { tokenId, reason });
      }

      setCredentials(prev => prev.map(c => 
        c.tokenId === tokenId ? { ...c, isRevoked: true } : c
      ));
      
      toast.success('Credential revoked successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to revoke credential:', error);
      toast.error(error.message || 'Failed to revoke credential');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, service, simulateTransaction]);

  const getCredentialsByRecipient = useCallback((address) => {
    return credentials.filter(c => 
      c.recipient?.toLowerCase() === address?.toLowerCase()
    );
  }, [credentials]);

  const getCredentialsByIssuer = useCallback((address) => {
    return credentials.filter(c => 
      c.issuer?.toLowerCase() === address?.toLowerCase()
    );
  }, [credentials]);

  const getCredentialById = useCallback((id) => {
    return credentials.find(c => c.id === id || c.tokenId === id);
  }, [credentials]);

  const generateShareLink = useCallback((credentialId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify?id=${credentialId}`;
  }, []);

  const getStatistics = useCallback(() => {
    const userCredentials = user?.type === 'institution'
      ? getCredentialsByIssuer(user?.walletAddress || account)
      : getCredentialsByRecipient(user?.walletAddress || account);

    return {
      totalCredentials: userCredentials.length,
      activeCredentials: userCredentials.filter(c => !c.isRevoked).length,
      revokedCredentials: userCredentials.filter(c => c.isRevoked).length,
      pendingVerifications: verifications.filter(v => !v.isValid).length,
      recentVerifications: verifications.slice(0, 5),
    };
  }, [credentials, verifications, user, account, getCredentialsByIssuer, getCredentialsByRecipient]);

  const value = {
    credentials,
    verifications,
    isLoading,
    selectedCredential,
    setSelectedCredential,
    credentialTypes: CREDENTIAL_TYPES,
    issueCredential,
    verifyCredential,
    revokeCredential,
    getCredentialsByRecipient,
    getCredentialsByIssuer,
    getCredentialById,
    generateShareLink,
    getStatistics,
  };

  return (
    <CredentialContext.Provider value={value}>
      {children}
    </CredentialContext.Provider>
  );
};

export const useCredentials = () => {
  const context = useContext(CredentialContext);
  if (!context) {
    throw new Error('useCredentials must be used within a CredentialProvider');
  }
  return context;
};

export default CredentialContext;
