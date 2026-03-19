import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { SUBSCRIPTION_ABI } from "./subscriptionABI";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT || "";

// Base Mainnet chain config
export const BASE_MAINNET = {
  chainId: "0x2105", // 8453
  chainName: "Base",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

/**
 * Get a contract instance (read-only or with signer).
 */
export function getContract(signerOrProvider: any) {
  return new Contract(CONTRACT_ADDRESS, SUBSCRIPTION_ABI, signerOrProvider);
}

/**
 * Subscribe: sends ETH to the contract.
 */
export async function subscribe(signer: any): Promise<string> {
  const contract = getContract(signer);
  const price = await contract.subscriptionPrice();
  const tx = await contract.subscribe({ value: price });
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Cancel active subscription.
 */
export async function cancelSubscription(signer: any): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.cancelSubscription();
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Check if an address is currently subscribed.
 */
export async function checkSubscription(provider: any, address: string): Promise<boolean> {
  const contract = getContract(provider);
  return contract.isSubscribed(address);
}

/**
 * Get subscription expiry timestamp.
 */
export async function getExpiry(provider: any, address: string): Promise<number> {
  const contract = getContract(provider);
  const expiry = await contract.getExpiry(address);
  return Number(expiry);
}

/**
 * Get subscription price in ETH (formatted).
 */
export async function getPrice(provider: any): Promise<string> {
  const contract = getContract(provider);
  const price = await contract.subscriptionPrice();
  return formatEther(price);
}

/**
 * Get subscription duration in days.
 */
export async function getDuration(provider: any): Promise<number> {
  const contract = getContract(provider);
  const duration = await contract.subscriptionDuration();
  return Number(duration) / 86400;
}

/**
 * Switch wallet to Base mainnet.
 */
export async function switchToBase() {
  if (!window.ethereum) throw new Error("No wallet detected");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_MAINNET.chainId }],
    });
  } catch (err: any) {
    // Chain not added — add it
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BASE_MAINNET],
      });
    } else {
      throw err;
    }
  }
}

