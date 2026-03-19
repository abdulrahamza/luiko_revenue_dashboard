const hre = require("hardhat");

async function main() {
  // Default: 0.001 ETH, 30 days
  const SUBSCRIPTION_PRICE = hre.ethers.parseEther("0.001");
  const SUBSCRIPTION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

  console.log("Deploying LaukiSubscription to Base mainnet...");
  console.log(`  Price: 0.001 ETH (${SUBSCRIPTION_PRICE.toString()} wei)`);
  console.log(`  Duration: 30 days (${SUBSCRIPTION_DURATION} seconds)`);

  const LaukiSubscription = await hre.ethers.getContractFactory("LaukiSubscription");
  const contract = await LaukiSubscription.deploy(SUBSCRIPTION_PRICE, SUBSCRIPTION_DURATION);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ LaukiSubscription deployed!");
  console.log(`   Address: ${address}`);
  console.log(`   Network: Base mainnet (chain ID 8453)`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Add to your .env.local:`);
  console.log(`      NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=${address}`);
  console.log(`   2. Restart your Next.js dev server`);
  console.log(`   3. Open your dashboard and test subscription`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
