"use client";

import WalletProvider from "./WalletProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
