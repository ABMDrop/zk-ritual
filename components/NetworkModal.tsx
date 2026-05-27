"use client";
import { useWrongNetwork } from "@/hooks/useWrongNetwork";

export function NetworkModal() {
  const { isWrongNetwork, switchToRitual, chainId } = useWrongNetwork();

  if (!isWrongNetwork) return null;

  return (
    <div style={{
      position:        "fixed",
      inset:           0,
      zIndex:          9999,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter:  "blur(4px)",
    }}>
      <div style={{
        background:    "#0f0f0f",
        border:        "1px solid #2a2a2a",
        borderRadius:  "12px",
        padding:       "40px 32px",
        maxWidth:      "400px",
        width:         "90%",
        textAlign:     "center",
        fontFamily:    "monospace",
      }}>
        {/* Icon */}
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>

        {/* Title */}
        <h2 style={{
          color:         "#ff4444",
          fontSize:      "18px",
          fontWeight:    "bold",
          letterSpacing: "0.1em",
          marginBottom:  "12px",
          textTransform: "uppercase",
        }}>
          Wrong Network
        </h2>

        {/* Description */}
        <p style={{
          color:         "#aaaaaa",
          fontSize:      "14px",
          lineHeight:    "1.6",
          marginBottom:  "8px",
        }}>
          You are connected to chain ID <strong style={{ color: "#ffffff" }}>{chainId}</strong>.
        </p>
        <p style={{
          color:         "#aaaaaa",
          fontSize:      "14px",
          lineHeight:    "1.6",
          marginBottom:  "28px",
        }}>
          ZK-Ritual runs on <strong style={{ color: "#00ff88" }}>Ritual Testnet</strong> (Chain ID: 1979).
          Please switch to continue.
        </p>

        {/* Switch Button */}
        <button
          onClick={switchToRitual}
          style={{
            width:           "100%",
            padding:         "14px",
            background:      "#00ff88",
            color:           "#000000",
            border:          "none",
            borderRadius:    "8px",
            fontSize:        "14px",
            fontWeight:      "bold",
            fontFamily:      "monospace",
            letterSpacing:   "0.08em",
            textTransform:   "uppercase",
            cursor:          "pointer",
            marginBottom:    "12px",
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#00cc6e")}
          onMouseOut={e  => (e.currentTarget.style.background = "#00ff88")}
        >
          Switch to Ritual Testnet
        </button>

        {/* Network details hint */}
        <p style={{ color: "#555555", fontSize: "11px", lineHeight: "1.8" }}>
          RPC: ritual-testnet-rpc.node.ritual.net<br />
          Chain ID: 1979 · Symbol: ETH
        </p>
      </div>
    </div>
  );
}
