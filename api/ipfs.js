/**
 * Vercel Serverless API Proxy for Pinata IPFS
 * 
 * This keeps PINATA_API_KEY, PINATA_SECRET_KEY, and PINATA_JWT
 * on the server side. The client calls /api/ipfs instead of Pinata directly.
 * 
 * Set these in Vercel Dashboard > Settings > Environment Variables:
 *   PINATA_API_KEY
 *   PINATA_SECRET_KEY
 *   PINATA_JWT
 */

const PINATA_API_URL = 'https://api.pinata.cloud';

function getAuthHeaders() {
  if (process.env.PINATA_JWT) {
    return {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    };
  }
  return {
    pinata_api_key: process.env.PINATA_API_KEY || '',
    pinata_secret_api_key: process.env.PINATA_SECRET_KEY || '',
  };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'pin-json': {
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case 'pin-status': {
        const { hash } = req.query;
        if (!hash) {
          return res.status(400).json({ error: 'Hash parameter required' });
        }

        const response = await fetch(
          `${PINATA_API_URL}/data/pinList?hashContains=${hash}`,
          { headers: getAuthHeaders() }
        );

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      case 'unpin': {
        if (req.method !== 'DELETE') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { hash: unpinHash } = req.query;
        if (!unpinHash) {
          return res.status(400).json({ error: 'Hash parameter required' });
        }

        const response = await fetch(
          `${PINATA_API_URL}/pinning/unpin/${unpinHash}`,
          {
            method: 'DELETE',
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          return res.status(200).json({ success: true });
        }

        const data = await response.json();
        return res.status(response.status).json(data);
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use: pin-json, pin-status, unpin' });
    }
  } catch (error) {
    console.error('IPFS API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
