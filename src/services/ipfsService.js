/**
 * IPFS Service - Pinata Integration
 * Handles uploading and retrieving credential metadata from IPFS
 */

// NOTE: Pinata API keys are NOT stored in client code.
// Authenticated operations go through the Vercel serverless proxy at /api/ipfs.
// Only the public gateway URL is kept client-side (for reading, no auth needed).
const PINATA_GATEWAY = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

class IPFSService {
  constructor() {
    // Use Vercel serverless proxy for authenticated Pinata API calls
    this.proxyApiUrl = '/api/ipfs';
    // Check if the proxy is available (will be true on Vercel, false in local dev without proxy)
    this.isConfigured = true; // Always try proxy first, fallback to demo mode
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   * @param {Object} metadata - The credential metadata to upload
   * @returns {Object} - IPFS hash and gateway URL
   */
  async uploadMetadata(metadata) {
    if (!this.isConfigured) {
      // Return mock IPFS hash for demo mode
      console.warn('Pinata not configured, using demo mode');
      return this.generateMockIPFSHash(metadata);
    }

    try {
      const response = await fetch(`${this.proxyApiUrl}?action=pin-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `VeriChain-Credential-${Date.now()}`,
            keyvalues: {
              type: metadata.credentialType || 'credential',
              issuer: metadata.issuer || 'unknown',
            },
          },
          pinataOptions: {
            cidVersion: 1,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload to IPFS');
      }

      const data = await response.json();
      
      return {
        success: true,
        ipfsHash: data.IpfsHash,
        pinSize: data.PinSize,
        timestamp: data.Timestamp,
        gatewayUrl: `${PINATA_GATEWAY}${data.IpfsHash}`,
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param {File} file - The file to upload
   * @returns {Object} - IPFS hash and gateway URL
   */
  async uploadFile(file) {
    if (!this.isConfigured) {
      console.warn('Pinata not configured, using demo mode');
      return this.generateMockIPFSHash({ fileName: file.name });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: file.name,
      }));
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
      }));

      const response = await fetch(`${this.proxyApiUrl}?action=pin-file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload file to IPFS');
      }

      const data = await response.json();
      
      return {
        success: true,
        ipfsHash: data.IpfsHash,
        pinSize: data.PinSize,
        timestamp: data.Timestamp,
        gatewayUrl: `${PINATA_GATEWAY}${data.IpfsHash}`,
      };
    } catch (error) {
      console.error('IPFS file upload failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve metadata from IPFS
   * @param {string} ipfsHash - The IPFS hash to retrieve
   * @returns {Object} - The metadata content
   */
  async getMetadata(ipfsHash) {
    try {
      // Try Pinata gateway first
      const gatewayUrl = `${PINATA_GATEWAY}${ipfsHash}`;
      const response = await fetch(gatewayUrl);
      
      if (!response.ok) {
        // Fallback to public gateway
        const publicGateway = `https://ipfs.io/ipfs/${ipfsHash}`;
        const fallbackResponse = await fetch(publicGateway);
        
        if (!fallbackResponse.ok) {
          throw new Error('Failed to retrieve from IPFS');
        }
        
        return await fallbackResponse.json();
      }
      
      return await response.json();
    } catch (error) {
      console.error('IPFS retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Check if an IPFS hash is pinned
   * @param {string} ipfsHash - The IPFS hash to check
   * @returns {boolean} - Whether the content is pinned
   */
  async isPinned(ipfsHash) {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.proxyApiUrl}?action=pin-status&hash=${ipfsHash}`
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.count > 0;
    } catch (error) {
      console.error('Pin check failed:', error);
      return false;
    }
  }

  /**
   * Unpin content from IPFS
   * @param {string} ipfsHash - The IPFS hash to unpin
   */
  async unpin(ipfsHash) {
    if (!this.isConfigured) {
      return { success: true };
    }

    try {
      const response = await fetch(`${this.proxyApiUrl}?action=unpin&hash=${ipfsHash}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpin from IPFS');
      }

      return { success: true };
    } catch (error) {
      console.error('Unpin failed:', error);
      throw error;
    }
  }

  /**
   * Generate mock IPFS hash for demo mode
   * @param {Object} data - Data to generate hash for
   * @returns {Object} - Mock IPFS response
   */
  generateMockIPFSHash(data) {
    // Generate a realistic-looking IPFS CIDv1 hash
    const characters = 'abcdefghijklmnopqrstuvwxyz234567';
    let hash = 'bafybeig';
    for (let i = 0; i < 44; i++) {
      hash += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return {
      success: true,
      ipfsHash: hash,
      pinSize: JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
      gatewayUrl: `${PINATA_GATEWAY}${hash}`,
      isDemo: true,
    };
  }

  /**
   * Create credential metadata object
   * @param {Object} params - Credential parameters
   * @returns {Object} - Formatted metadata following ERC-721 standard
   */
  createCredentialMetadata({
    title,
    description,
    credentialType,
    issuer,
    issuerName,
    recipient,
    issueDate,
    expiryDate,
    additionalData = {},
  }) {
    return {
      name: title,
      description: description,
      image: `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`, // Generated image
      external_url: 'https://verichain.app',
      attributes: [
        {
          trait_type: 'Credential Type',
          value: credentialType,
        },
        {
          trait_type: 'Issuer',
          value: issuerName,
        },
        {
          trait_type: 'Issuer Address',
          value: issuer,
        },
        {
          trait_type: 'Recipient',
          value: recipient,
        },
        {
          trait_type: 'Issue Date',
          value: issueDate,
          display_type: 'date',
        },
        ...(expiryDate ? [{
          trait_type: 'Expiry Date',
          value: expiryDate,
          display_type: 'date',
        }] : []),
        {
          trait_type: 'Status',
          value: 'Active',
        },
      ],
      properties: {
        credentialType,
        issuer,
        issuerName,
        recipient,
        issueDate,
        expiryDate,
        createdAt: new Date().toISOString(),
        version: '1.0',
        ...additionalData,
      },
    };
  }

  /**
   * Get IPFS gateway URL
   * @param {string} ipfsHash - The IPFS hash
   * @returns {string} - Full gateway URL
   */
  getGatewayUrl(ipfsHash) {
    if (ipfsHash.startsWith('ipfs://')) {
      ipfsHash = ipfsHash.replace('ipfs://', '');
    }
    return `${PINATA_GATEWAY}${ipfsHash}`;
  }

  /**
   * Check if Pinata is configured
   * @returns {boolean}
   */
  isIPFSConfigured() {
    return this.isConfigured;
  }
}

// Export singleton instance
const ipfsService = new IPFSService();
export default ipfsService;
