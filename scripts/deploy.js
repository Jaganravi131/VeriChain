const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying VeriChainCredential contract...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Deploy the contract
  const VeriChainCredential = await hre.ethers.getContractFactory("VeriChainCredential");
  const contract = await VeriChainCredential.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ VeriChainCredential deployed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("\n============================================");
  console.log("IMPORTANT: Add this to your .env file:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("============================================\n");

  // Verify the deployer has admin role
  const ADMIN_ROLE = await contract.ADMIN_ROLE();
  const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
  console.log("🔐 Deployer has ADMIN_ROLE:", hasAdminRole);

  // Wait for block confirmations before verification
  console.log("\n⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);

  // Verify on Polygonscan (if API key is provided)
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Polygonscan!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract is already verified.");
      } else {
        console.log("⚠️  Verification failed:", error.message);
      }
    }
  } else {
    console.log("\nℹ️  Skipping Polygonscan verification (no API key provided)");
    console.log("   To verify later, run:");
    console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  }

  // Output network info
  console.log("\n📊 Deployment Summary:");
  console.log("------------------------");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used:", contract.deploymentTransaction().gasLimit?.toString() || "N/A");
  console.log("------------------------\n");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
