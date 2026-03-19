/**
 * Example: Read subscription data directly from the contract on-chain.
 *
 * Usage:
 *   node hardhat/scripts/read-subscription.cjs <wallet-address>
 *
 * Requires:
 *   NEXT_PUBLIC_SUBSCRIPTION_CONTRACT in .env.local
 */

const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env.local") });

const ABI = [
  "function isSubscribed(address _addr) view returns (bool)",
  "function getExpiry(address _addr) view returns (uint256)",
  "function subscriptionPrice() view returns (uint256)",
  "function subscriptionDuration() view returns (uint256)",
  "function owner() view returns (address)",
];

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT;
  if (!contractAddress) {
    console.error("❌ NEXT_PUBLIC_SUBSCRIPTION_CONTRACT not set in .env.local");
    process.exit(1);
  }

  const walletAddress = process.argv[2];
  if (!walletAddress) {
    console.error("Usage: node read-subscription.cjs <wallet-address>");
    process.exit(1);
  }

  // Connect to Base mainnet
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const contract = new ethers.Contract(contractAddress, ABI, provider);

  console.log(`\n📄 LaukiSubscription Contract: ${contractAddress}`);
  console.log(`🔗 Network: Base mainnet (chain ID 8453)\n`);

  // Read contract info
  const price = await contract.subscriptionPrice();
  const duration = await contract.subscriptionDuration();
  const owner = await contract.owner();

  console.log(`Owner:    ${owner}`);
  console.log(`Price:    ${ethers.formatEther(price)} ETH`);
  console.log(`Duration: ${Number(duration) / 86400} days\n`);

  // Read subscription status
  const isActive = await contract.isSubscribed(walletAddress);
  const expiry = await contract.getExpiry(walletAddress);

  console.log(`--- Subscription for ${walletAddress} ---`);
  console.log(`Active:  ${isActive}`);

  if (Number(expiry) > 0) {
    const expiryDate = new Date(Number(expiry) * 1000);
    console.log(`Expiry:  ${expiryDate.toISOString()}`);
    if (isActive) {
      const remaining = Number(expiry) - Math.floor(Date.now() / 1000);
      console.log(`Remaining: ${(remaining / 86400).toFixed(1)} days`);
    }
  } else {
    console.log(`Expiry:  Never subscribed`);
  }
}

main().catch(console.error);
