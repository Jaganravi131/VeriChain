<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Polygon-purple?style=for-the-badge&logo=polygon" alt="Polygon"/>
  <img src="https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity" alt="Solidity"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🔗 VeriChain</h1>

<p align="center">
  <strong>Blockchain-Powered Digital Credential Verification Platform</strong>
</p>

<p align="center">
  <em>Issue, Store, and Verify Academic & Professional Credentials as Soulbound Tokens (SBTs)</em>
</p>

---

## 🌟 Overview

VeriChain revolutionizes credential verification by leveraging blockchain technology to create tamper-proof, instantly verifiable digital credentials. Built on the Polygon network, VeriChain enables educational institutions and organizations to issue Soulbound Tokens (SBTs) - non-transferable NFTs permanently linked to recipients.

### Why VeriChain?

- 🔒 **Tamper-Proof**: Credentials stored on blockchain cannot be altered or forged
- ⚡ **Instant Verification**: Verify any credential in seconds without contacting issuers
- 🌍 **Global Access**: Accessible 24/7 from anywhere in the world
- 💰 **Cost-Effective**: Built on Polygon for minimal transaction fees
- 🔐 **Privacy-Focused**: Recipients control who sees their credentials

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Soulbound Tokens** | Non-transferable tokens permanently linked to recipient's wallet |
| **MetaMask Integration** | Seamless wallet connection for secure transactions |
| **IPFS Storage** | Decentralized metadata storage via Pinata |
| **Institution Dashboard** | Complete credential management for issuers |
| **Digital Wallet** | Recipients can view, share, and download credentials |
| **Verification Portal** | Anyone can verify credential authenticity |
| **QR Code Sharing** | Generate shareable QR codes for credentials |
| **PDF Certificates** | Download verified credentials as PDF documents |
| **Demo Mode** | Full functionality without blockchain for testing |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Institution │  │    User      │  │ Verification │              │
│  │  Dashboard   │  │   Wallet     │  │    Portal    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼─────────────────┼─────────────────┼──────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN SERVICE                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    ethers.js + MetaMask                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Smart Contract │  │   IPFS/Pinata  │  │ Polygon Network │
│  (SBT ERC-721)  │  │   (Metadata)   │  │  (Amoy Testnet) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+ 
- [MetaMask](https://metamask.io/) browser extension
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jaganravi131/VeriChain.git
cd VeriChain

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm start
```

### Demo Mode

Start exploring immediately without any configuration! Click **"Start Demo"** on the landing page to access full functionality with simulated blockchain.

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Institution | demo@techuniversity.edu | demo123 |
| Student | john.doe@student.edu | demo123 |

---

## ⚙️ Configuration

### Required API Keys

Create a `.env` file with the following credentials:

```env
# Blockchain (for deployment only)
PRIVATE_KEY=your_metamask_private_key

# RPC Provider (choose one)
ALCHEMY_API_KEY=your_alchemy_api_key

# IPFS Storage
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret
REACT_APP_PINATA_JWT=your_pinata_jwt

# Contract (after deployment)
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
```

### Getting API Keys

| Service | Purpose | Link |
|---------|---------|------|
| **Alchemy** | Polygon RPC Provider | [alchemy.com](https://www.alchemy.com/) |
| **Pinata** | IPFS Storage | [pinata.cloud](https://www.pinata.cloud/) |
| **PolygonScan** | Contract Verification | [polygonscan.com](https://polygonscan.com/) |

### MetaMask Setup

1. Install MetaMask extension
2. Add Polygon Amoy Testnet:
   - **Network Name**: Polygon Amoy
   - **RPC URL**: `https://rpc-amoy.polygon.technology/`
   - **Chain ID**: `80002`
   - **Symbol**: `MATIC`
3. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

---

## 📜 Smart Contract

### Deployment

```bash
# Compile contract
npx hardhat compile

# Deploy to Polygon Amoy Testnet
npx hardhat run scripts/deploy.js --network amoy

# Verify on PolygonScan (optional)
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

### Contract Features

- **ERC-721 Compatible**: Standard NFT interface
- **Soulbound**: Tokens cannot be transferred after minting
- **Role-Based Access**: Institution and Admin roles
- **Credential Management**: Issue, verify, and revoke credentials
- **On-Chain Verification**: Instant credential validation

---

## 📁 Project Structure

```
VeriChain/
├── contracts/
│   └── VeriChainCredential.sol    # Smart contract
├── scripts/
│   └── deploy.js                   # Deployment script
├── src/
│   ├── components/                 # Reusable UI components
│   ├── pages/                      # Application pages
│   ├── services/                   # Blockchain & IPFS services
│   ├── state/                      # React Context providers
│   └── App.js                      # Main application
├── public/                         # Static assets
├── .env.example                    # Environment template
├── hardhat.config.js               # Hardhat configuration
└── package.json                    # Dependencies
```

---

## 🎯 Usage

### For Institutions

1. **Register** your institution on the platform
2. **Connect** MetaMask wallet
3. **Issue** credentials to students/recipients
4. **Manage** credential history and revocations

### For Recipients

1. **Receive** credentials in your digital wallet
2. **View** all your verified credentials
3. **Share** via QR code or direct link
4. **Download** as PDF certificate

### For Verifiers

1. **Enter** credential ID or scan QR code
2. **View** complete credential details
3. **Verify** authenticity instantly

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Material-UI 5, React Router 6 |
| **Blockchain** | Solidity 0.8.20, OpenZeppelin, Hardhat |
| **Web3** | ethers.js 6, MetaMask |
| **Storage** | IPFS via Pinata |
| **Network** | Polygon Amoy Testnet / Mainnet |

---

## 🔒 Security

- ⚠️ **Never commit `.env` files** - Contains sensitive credentials
- 🔑 **Secure private keys** - Use hardware wallets for production
- 🧪 **Test on testnets first** - Use Amoy before mainnet
- 📋 **Audit smart contracts** - Before production deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jagan Ravi**
- GitHub: [@Jaganravi131](https://github.com/Jaganravi131)

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [Polygon](https://polygon.technology/) - Blockchain network
- [Pinata](https://pinata.cloud/) - IPFS pinning service
- [Material-UI](https://mui.com/) - React component library

---

<p align="center">
  <strong>Built with ❤️ for the future of credential verification</strong>
</p>
