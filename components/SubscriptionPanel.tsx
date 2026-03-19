"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./WalletProvider";
import {
  subscribe as doSubscribe,
  cancelSubscription as doCancel,
  checkSubscription,
  getExpiry,
  getPrice,
  getDuration,
} from "@/lib/subscription";

type Status = "idle" | "loading" | "subscribing" | "cancelling";

export default function SubscriptionPanel() {
  const { account, provider, signer, connectWallet, isConnecting, error: walletError } = useWallet();

  const [isActive, setIsActive] = useState(false);
  const [expiry, setExpiry] = useState<number>(0);
  const [price, setPriceVal] = useState("0");
  const [duration, setDurationVal] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT || "";

  // Fetch subscription state
  const refresh = useCallback(async () => {
    if (!provider || !account || !contractAddress) return;
    setStatus("loading");
    try {
      const [active, exp, p, d] = await Promise.all([
        checkSubscription(provider, account),
        getExpiry(provider, account),
        getPrice(provider),
        getDuration(provider),
      ]);
      setIsActive(active);
      setExpiry(exp);
      setPriceVal(p);
      setDurationVal(d);
    } catch (err: any) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setStatus("idle");
    }
  }, [provider, account, contractAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe
  const handleSubscribe = async () => {
    if (!signer) return;
    setStatus("subscribing");
    setError(null);
    setTxHash(null);
    try {
      const hash = await doSubscribe(signer);
      setTxHash(hash);
      await refresh();
    } catch (err: any) {
      setError(err.reason || err.message || "Subscription failed");
    } finally {
      setStatus("idle");
    }
  };

  // Cancel
  const handleCancel = async () => {
    if (!signer) return;
    setStatus("cancelling");
    setError(null);
    setTxHash(null);
    try {
      const hash = await doCancel(signer);
      setTxHash(hash);
      await refresh();
    } catch (err: any) {
      setError(err.reason || err.message || "Cancellation failed");
    } finally {
      setStatus("idle");
    }
  };

  // No contract configured
  if (!contractAddress) {
    return (
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
          Subscription
        </h3>
        <p className="text-zinc-400 text-sm">
          Contract not deployed yet. Set{" "}
          <code className="text-amber-400">NEXT_PUBLIC_SUBSCRIPTION_CONTRACT</code>{" "}
          in <code className="text-amber-400">.env.local</code> after deployment.
        </p>
      </div>
    );
  }

  // Wallet not connected
  if (!account) {
    return (
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-zinc-500" />
          Subscription
        </h3>
        <p className="text-zinc-400 text-sm mb-4">
          Connect your wallet to manage your subscription on Base.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                     bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
        >
          {isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting…
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>
        {walletError && (
          <p className="mt-3 text-red-400 text-xs">{walletError}</p>
        )}
      </div>
    );
  }

  // Connected — show subscription management
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isActive ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-red-400"
            }`}
          />
          Subscription
        </h3>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isActive
              ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
              : "bg-red-400/10 text-red-400 border border-red-400/20"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Wallet address */}
      <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
        <p className="text-zinc-500 text-xs mb-1">Connected Wallet</p>
        <p className="text-sm font-mono text-zinc-300 break-all">
          {account}
        </p>
      </div>

      {/* Subscription info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-zinc-500 text-xs mb-1">Price</p>
          <p className="text-sm font-bold">{price} ETH</p>
        </div>
        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-zinc-500 text-xs mb-1">Duration</p>
          <p className="text-sm font-bold">{duration} days</p>
        </div>
      </div>

      {isActive && expiry > 0 && (
        <div className="mb-4 p-3 bg-emerald-400/5 border border-emerald-400/10 rounded-lg">
          <p className="text-zinc-500 text-xs mb-1">Expires</p>
          <p className="text-sm font-semibold text-emerald-400">
            {new Date(expiry * 1000).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {/* Actions */}
      {!isActive ? (
        <button
          onClick={handleSubscribe}
          disabled={status !== "idle"}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                     bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30"
        >
          {status === "subscribing" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Subscribing…
            </span>
          ) : (
            `Subscribe for ${price} ETH`
          )}
        </button>
      ) : (
        <button
          onClick={handleCancel}
          disabled={status !== "idle"}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                     bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400
                     border border-zinc-700 hover:border-red-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "cancelling" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cancelling…
            </span>
          ) : (
            "Cancel Subscription"
          )}
        </button>
      )}

      {/* Transaction hash */}
      {txHash && (
        <div className="mt-3 p-3 bg-blue-400/5 border border-blue-400/10 rounded-lg">
          <p className="text-zinc-500 text-xs mb-1">Transaction</p>
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 break-all underline"
          >
            {txHash}
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-400/5 border border-red-400/10 rounded-lg">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
