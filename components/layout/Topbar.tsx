"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors }  = useConnect();
  const { disconnect }           = useDisconnect();
  const { profile }              = useProfile(address);
  const [dropOpen, setDropOpen]  = useState(false);
  const dropRef                  = useRef<HTMLDivElement>(null);

  // Bug 2 fix: short address for display, no PTS shown in header
  const shortAddr   = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const displayName = profile?.username || shortAddr;

  function handleConnect() {
    const mm = connectors.find(c => c.id === "metaMask" || c.name === "MetaMask");
    if (mm) connect({ connector: mm });
  }

  function handleCopy() {
    if (address) navigator.clipboard.writeText(address);
    setDropOpen(false);
  }

  function handleDisconnect() {
    disconnect();
    setDropOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    if (dropOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropOpen]);

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-50 flex items-center gap-2 px-4"
      style={{ maxWidth: 560, height: 56, background: "rgba(13,12,11,0.97)", borderBottom: "1px solid var(--bd)" }}>

      {/* Logo */}
      <span className="text-acc font-bold tracking-[4px] text-[17px]">👻</span>
      <div style={{ width:1, height:22, background:"var(--bd2)", flexShrink:0 }} />
      <span className="text-[10px] text-acc3 tracking-[1px] px-2 py-1 rounded border"
        style={{ borderColor:"var(--bd)" }}>RITUAL TESTNET</span>

      <div className="flex-1" />

      {/* Connect / Dropdown */}
      {isConnected ? (
        <div className="relative" ref={dropRef}>
          <button onClick={() => setDropOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-green3"
            style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.22)" }}>
            <span className="w-2 h-2 rounded-full bg-green inline-block animate-pulse" />
            {displayName}
          </button>

          {dropOpen && (
            <div className="absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
              style={{ minWidth: 200, background:"#1a1917", border:"1px solid var(--bd3)",
                boxShadow:"0 8px 32px rgba(0,0,0,0.6)" }}>
              {/* Wallet address header */}
              <div className="px-4 py-3" style={{ borderBottom:"1px solid var(--bd)" }}>
                <div className="text-[9px] text-acc3 tracking-widest mb-1">CONNECTED WALLET</div>
                <div className="text-[10px] text-acc2 font-mono">{shortAddr}</div>
              </div>

              {/* Copy Address */}
              <button onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[11px] text-acc2 font-bold hover:bg-white/5 transition-colors">
                <span className="text-[14px]">⧉</span>
                Copy Address
              </button>

              {/* Disconnect */}
              <button onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[11px] font-bold transition-colors hover:bg-white/5"
                style={{ color:"#f87171", borderTop:"1px solid var(--bd)" }}>
                <span className="text-[14px]">⏻</span>
                Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleConnect}
          className="px-3 py-2 rounded-lg text-[11px] font-bold text-acc"
          style={{ background:"rgba(255,252,248,0.05)", border:"1px solid var(--bd3)" }}>
          Connect MetaMask
        </button>
      )}
    </header>
  );
}
