// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VeriChainCredential
 * @dev Soulbound Token (SBT) implementation for digital credentials
 * @notice This contract manages non-transferable credential tokens
 * 
 * Features:
 * - Soulbound (non-transferable) tokens
 * - Institution-based access control
 * - Credential issuance and revocation
 * - On-chain verification
 * - Metadata storage via IPFS
 */
contract VeriChainCredential is ERC721, ERC721URIStorage, AccessControl {
    // Role definitions
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Token ID counter (replacing deprecated Counters library)
    uint256 private _tokenIdCounter;

    // Credential structure
    struct Credential {
        uint256 tokenId;
        address issuer;
        address recipient;
        string credentialType;
        string title;
        string ipfsHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isRevoked;
        bytes32 credentialHash;
    }

    // Institution structure
    struct Institution {
        string name;
        string description;
        address walletAddress;
        bool isVerified;
        uint256 registeredAt;
        uint256 credentialsIssued;
    }

    // Mappings
    mapping(uint256 => Credential) public credentials;
    mapping(address => Institution) public institutions;
    mapping(address => uint256[]) public recipientCredentials;
    mapping(address => uint256[]) public issuerCredentials;
    mapping(bytes32 => uint256) public hashToTokenId;
    mapping(address => bool) public registeredInstitutions;

    // Events
    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed recipient,
        string credentialType,
        string title,
        string ipfsHash,
        uint256 timestamp
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        address indexed revoker,
        string reason,
        uint256 timestamp
    );

    event InstitutionRegistered(
        address indexed institution,
        string name,
        uint256 timestamp
    );

    event InstitutionVerified(
        address indexed institution,
        uint256 timestamp
    );

    event CredentialVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );

    // Errors
    error SoulboundTokenCannotBeTransferred();
    error CredentialNotFound();
    error CredentialAlreadyRevoked();
    error InstitutionNotRegistered();
    error InvalidRecipientAddress();
    error CredentialExpired();

    /**
     * @dev Constructor initializes the contract with admin role
     */
    constructor() ERC721("VeriChain Credential", "VCRED") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new institution
     * @param name Institution name
     * @param description Institution description
     */
    function registerInstitution(
        string memory name,
        string memory description
    ) external {
        require(!registeredInstitutions[msg.sender], "Institution already registered");
        
        institutions[msg.sender] = Institution({
            name: name,
            description: description,
            walletAddress: msg.sender,
            isVerified: false,
            registeredAt: block.timestamp,
            credentialsIssued: 0
        });

        registeredInstitutions[msg.sender] = true;
        _grantRole(INSTITUTION_ROLE, msg.sender);

        emit InstitutionRegistered(msg.sender, name, block.timestamp);
    }

    /**
     * @dev Verify an institution (admin only)
     * @param institutionAddress Address of the institution to verify
     */
    function verifyInstitution(address institutionAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(registeredInstitutions[institutionAddress], "Institution not registered");
        institutions[institutionAddress].isVerified = true;
        
        emit InstitutionVerified(institutionAddress, block.timestamp);
    }

    /**
     * @dev Issue a new credential (SBT)
     * @param recipient Address of the credential recipient
     * @param credentialType Type of credential
     * @param title Credential title
     * @param ipfsHash IPFS hash of credential metadata
     * @param expiresAt Expiration timestamp (0 for no expiration)
     */
    function issueCredential(
        address recipient,
        string memory credentialType,
        string memory title,
        string memory ipfsHash,
        uint256 expiresAt
    ) external onlyRole(INSTITUTION_ROLE) returns (uint256) {
        if (recipient == address(0)) revert InvalidRecipientAddress();
        if (!registeredInstitutions[msg.sender]) revert InstitutionNotRegistered();

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        // Generate credential hash for verification
        bytes32 credentialHash = keccak256(
            abi.encodePacked(
                tokenId,
                msg.sender,
                recipient,
                credentialType,
                title,
                ipfsHash,
                block.timestamp
            )
        );

        // Create credential record
        credentials[tokenId] = Credential({
            tokenId: tokenId,
            issuer: msg.sender,
            recipient: recipient,
            credentialType: credentialType,
            title: title,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isRevoked: false,
            credentialHash: credentialHash
        });

        // Update mappings
        recipientCredentials[recipient].push(tokenId);
        issuerCredentials[msg.sender].push(tokenId);
        hashToTokenId[credentialHash] = tokenId;
        institutions[msg.sender].credentialsIssued++;

        // Mint the SBT
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://", ipfsHash)));

        emit CredentialIssued(
            tokenId,
            msg.sender,
            recipient,
            credentialType,
            title,
            ipfsHash,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @dev Revoke a credential
     * @param tokenId Token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(uint256 tokenId, string memory reason) external {
        Credential storage cred = credentials[tokenId];
        
        if (cred.tokenId == 0) revert CredentialNotFound();
        if (cred.isRevoked) revert CredentialAlreadyRevoked();
        
        require(
            cred.issuer == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to revoke"
        );

        cred.isRevoked = true;

        emit CredentialRevoked(tokenId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Verify a credential's validity
     * @param tokenId Token ID to verify
     * @return isValid Whether the credential is valid
     * @return credential The credential details
     */
    function verifyCredential(uint256 tokenId) 
        external 
        returns (bool isValid, Credential memory credential) 
    {
        Credential memory cred = credentials[tokenId];
        
        if (cred.tokenId == 0) {
            emit CredentialVerified(tokenId, msg.sender, false, block.timestamp);
            return (false, cred);
        }

        bool expired = cred.expiresAt > 0 && block.timestamp > cred.expiresAt;
        isValid = !cred.isRevoked && !expired && _exists(tokenId);

        emit CredentialVerified(tokenId, msg.sender, isValid, block.timestamp);
        
        return (isValid, cred);
    }

    /**
     * @dev Get credential by hash
     * @param credentialHash Hash of the credential
     */
    function getCredentialByHash(bytes32 credentialHash) 
        external 
        view 
        returns (Credential memory) 
    {
        uint256 tokenId = hashToTokenId[credentialHash];
        return credentials[tokenId];
    }

    /**
     * @dev Get all credentials for a recipient
     * @param recipient Address of the recipient
     */
    function getCredentialsByRecipient(address recipient) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return recipientCredentials[recipient];
    }

    /**
     * @dev Get all credentials issued by an institution
     * @param issuer Address of the issuer
     */
    function getCredentialsByIssuer(address issuer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return issuerCredentials[issuer];
    }

    /**
     * @dev Get institution details
     * @param institutionAddress Address of the institution
     */
    function getInstitution(address institutionAddress) 
        external 
        view 
        returns (Institution memory) 
    {
        return institutions[institutionAddress];
    }

    /**
     * @dev Check if an address is a registered institution
     * @param institutionAddress Address to check
     */
    function isInstitution(address institutionAddress) 
        external 
        view 
        returns (bool) 
    {
        return registeredInstitutions[institutionAddress];
    }

    /**
     * @dev Get total number of credentials issued
     */
    function getTotalCredentials() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Internal function to check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // ============================================
    // SOULBOUND IMPLEMENTATION (Disable Transfers)
    // ============================================

    /**
     * @dev Override to make tokens soulbound (non-transferable)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning
        if (from != address(0) && to != address(0)) {
            revert SoulboundTokenCannotBeTransferred();
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Disable approve for soulbound tokens
     */
    function approve(address, uint256) public virtual override(ERC721, IERC721) {
        revert SoulboundTokenCannotBeTransferred();
    }

    /**
     * @dev Disable setApprovalForAll for soulbound tokens
     */
    function setApprovalForAll(address, bool) public virtual override(ERC721, IERC721) {
        revert SoulboundTokenCannotBeTransferred();
    }

    // ============================================
    // REQUIRED OVERRIDES
    // ============================================

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
