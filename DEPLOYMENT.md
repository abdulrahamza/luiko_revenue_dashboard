# Deploying LaukiSubscription to Base Sepolia

Complete guide to deploy the on-chain subscription contract and integrate it with the dashboard.

## Prerequisites

- **Node.js** v18+
- **MetaMask** wallet with Base Sepolia ETH (for gas)
- **Base Sepolia ETH** — get free testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

## Step 1: Add Your Deployer Private Key

Add your wallet private key to `.env.local`:

```
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

> ⚠️ **Never commit this key.** It's already in `.gitignore`.

## Step 2: Install Hardhat Dependencies

```bash
cd hardhat
npm install
```

## Step 3: Compile the Contract

```bash
npm run compile
```

You should see:
```
Compiled 1 Solidity file successfully
```

## Step 4: Deploy to Base Sepolia

```bash
npm run deploy
```

Output:
```
✅ LaukiSubscription deployed!
   Address: 0x...
   Network: Base Sepolia (chain ID 84532)
```

## Step 5: Set the Contract Address

Copy the deployed address and add it to your root `.env.local`:

```
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=0xYOUR_DEPLOYED_ADDRESS
```

## Step 6: Install Frontend Dependencies

From the project root:

```bash
npm install ethers@^6.13.0
```

## Step 7: Start the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see the **Subscription** panel.

## Step 8: Test the Flow

1. Click **"Connect Wallet"** → MetaMask prompts for Base Sepolia
2. Click **"Subscribe for 0.001 ETH"** → MetaMask prompts for payment
3. After confirmation, status shows **"Active"** with expiry date
4. Click **"Cancel Subscription"** → status reverts to **"Inactive"**
5. Transaction hashes link to [Base Sepolia Explorer](https://sepolia.basescan.org)

## Reading Subscription Data On-Chain

To verify subscription status directly from the contract:

```bash
cd hardhat
node scripts/read-subscription.cjs 0xYOUR_WALLET_ADDRESS
```

## Contract Details

| Parameter | Default |
|-----------|---------|
| Price | 0.001 ETH |
| Duration | 30 days |
| Network | Base Sepolia (84532) |
| Solidity | ^0.8.20 |

The owner can update price and duration after deployment using the `setPrice()` and `setDuration()` functions.
