"use client";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

export interface WalletActivity {
  balance: number;
  txCount: number;
  walletAgeDays: number;
  loading: boolean;
  error: string | null;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// Ask MetaMask directly — bypasses any hardcoded RPC in wagmi config
async function ethRequest<T>(method: string, params: unknown[] = []): Promise<T> {
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  if (!eth) throw new Error("No wallet");
  return eth.request({ method, params }) as Promise<T>;
}

export function useWalletActivity(address?: `0x${string}`) {
  const [data, setData] = useState<WalletActivity>({
    balance: 0, txCount: 0, walletAgeDays: 0, loading: false, error: null,
  });

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    async function fetchData() {
      setData(d => ({ ...d, loading: true, error: null }));

      let balance = 0;
      let txCount = 0;

      // Balance — ask MetaMask, not wagmi's publicClient
      try {
        const raw = await ethRequest<string>("eth_getBalance", [address, "latest"]);
        balance = parseFloat(formatEther(BigInt(raw)));
      } catch (e) {
        console.error("[useWalletActivity] eth_getBalance failed:", e);
      }

      // TX count (nonce = confirmed sends from this address)
      try {
        const hex = await ethRequest<string>("eth_getTransactionCount", [address, "latest"]);
        txCount = parseInt(hex, 16);
      } catch (e) {
        console.error("[useWalletActivity] eth_getTransactionCount failed:", e);
      }

      if (!cancelled) {
        setData({ balance, txCount, walletAgeDays: 0, loading: false, error: null });
      }
    }

    fetchData().catch((e: unknown) => {
      if (!cancelled) {
        setData(d => ({ ...d, loading: false, error: (e as Error).message }));
      }
    });

    return () => { cancelled = true; };
  }, [address]);

  return data;
}
