"use client";
import { useAccount, useChainId } from "wagmi";

export const RITUAL_CHAIN_ID = 1979;

export function useWrongNetwork() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isWrongNetwork = isConnected && chainId !== RITUAL_CHAIN_ID;

  async function switchToRitual() {
    const eth = (window as Window & {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    }).ethereum;

    if (!eth) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }

    try {
      // Try switching first (if already added)
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7BB" }], // 1979 in hex
      });
    } catch (err: unknown) {
      // Error code 4902 = chain not added yet → add it
      if ((err as { code?: number }).code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId:           "0x7BB",
                chainName:         "Ritual Testnet",
                nativeCurrency:    { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls:           ["https://ritual-testnet-rpc.node.ritual.net"],
                blockExplorerUrls: ["https://explorer.ritualchain.com"],
              },
            ],
          });
        } catch (addErr) {
          console.error("[useWrongNetwork] failed to add network:", addErr);
        }
      } else {
        console.error("[useWrongNetwork] failed to switch network:", err);
      }
    }
  }

  return { isWrongNetwork, switchToRitual, chainId };
}
