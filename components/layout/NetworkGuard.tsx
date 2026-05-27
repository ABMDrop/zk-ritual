"use client";
import { useAccount, useChainId } from "wagmi";
import { useState } from "react";

const RITUAL_CHAIN_ID = 1979;

const RITUAL_CHAIN_PARAMS = {
  chainId: "0x7BB",
  chainName: "Ritual Testnet",
  nativeCurrency: { name: "Ritual", symbol: "RITUAL", decimals: 18 },
  rpcUrls: ["https://rpc.ritualfoundation.org"],
  blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
};

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId         = useChainId();
  const [adding, setAdding] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const isWrong = isConnected && chainId !== RITUAL_CHAIN_ID;
  if (!isWrong) return null;

  async function handleAddNetwork() {
    const eth = (window as Window & {
      ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
    }).ethereum;
    if (!eth) return;
    setAdding(true);
    setError(null);
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [RITUAL_CHAIN_PARAMS],
      });
    } catch (e: unknown) {
      const msg = (e as Error)?.message || "";
      if (!msg.includes("rejected") && !msg.includes("cancel")) {
        setError("Could not add network — try manually in MetaMask.");
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes rg-pulse {
          0%,100% { box-shadow: 0 0 22px 6px rgba(234,179,8,0.25), 0 0 0 1px rgba(234,179,8,0.35); }
          50%      { box-shadow: 0 0 38px 12px rgba(234,179,8,0.45), 0 0 0 1px rgba(234,179,8,0.55); }
        }
        @keyframes rg-btn-pulse {
          0%,100% { box-shadow: 0 0 14px 3px rgba(234,179,8,0.3); }
          50%      { box-shadow: 0 0 26px 8px rgba(234,179,8,0.6); }
        }
        @keyframes rg-fade-in {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg,#1a1710 0%,#110f09 55%,#1a1a10 100%)",
          borderRadius: 22,
          padding: "36px 26px 28px",
          maxWidth: 340, width: "100%",
          textAlign: "center",
          border: "1px solid rgba(234,179,8,0.35)",
          animation: "rg-pulse 2.8s ease-in-out infinite, rg-fade-in 0.35s ease-out forwards",
        }}>

          {/* Warning icon */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
            background: "rgba(234,179,8,0.10)", border: "2px solid rgba(234,179,8,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30,
          }}>
            ⚠
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: "'Space Mono',monospace", fontWeight: 700,
            fontSize: 14, letterSpacing: "2.5px", color: "#fbbf24",
            textTransform: "uppercase", marginBottom: 10,
          }}>
            WRONG NETWORK
          </div>

          <div style={{
            fontSize: 11, color: "rgba(255,252,248,0.55)",
            lineHeight: 1.7, marginBottom: 24,
            fontFamily: "'Space Mono',monospace",
          }}>
            Add <span style={{ color:"#fbbf24", fontWeight:700 }}>Ritual Testnet</span> to continue.
            <br />
            <span style={{ fontSize: 10, color: "rgba(255,252,248,0.35)" }}>
              Chain ID 1979 · rpc.ritualfoundation.org
            </span>
          </div>

          {/* Add network button */}
          <button
            onClick={handleAddNetwork}
            disabled={adding}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 12, marginBottom: 12,
              background: adding ? "rgba(234,179,8,0.08)" : "rgba(234,179,8,0.12)",
              border: "1.5px solid rgba(234,179,8,0.55)",
              color: "#fbbf24",
              fontFamily: "'Space Mono',monospace", fontWeight: 700,
              fontSize: 12, letterSpacing: "0.8px", cursor: adding ? "not-allowed" : "pointer",
              animation: adding ? "none" : "rg-btn-pulse 2.2s ease-in-out infinite",
              transition: "opacity 0.2s",
              opacity: adding ? 0.6 : 1,
            }}
          >
            {adding ? "⏳ ADDING NETWORK..." : "⚡ Add Ritual Testnet Automatically"}
          </button>

          {error && (
            <div style={{
              fontSize: 10, color: "#f87171", marginBottom: 10,
              fontFamily: "'Space Mono',monospace",
            }}>
              {error}
            </div>
          )}

          {/* RPC details */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 14px", textAlign: "left",
            fontSize: 9, color: "rgba(255,252,248,0.35)",
            fontFamily: "'Space Mono',monospace", lineHeight: 1.9,
          }}>
            <div><span style={{ color:"rgba(255,252,248,0.5)" }}>RPC:</span> rpc.ritualfoundation.org</div>
            <div><span style={{ color:"rgba(255,252,248,0.5)" }}>Chain ID:</span> 1979</div>
            <div><span style={{ color:"rgba(255,252,248,0.5)" }}>Symbol:</span> RITUAL</div>
          </div>
        </div>
      </div>
    </>
  );
}
