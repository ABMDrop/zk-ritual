"use client";
import { useAccount, useConnect } from "wagmi";
import { ReactNode, useState, useEffect } from "react";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import NetworkGuard from "./NetworkGuard";

type DeviceType = "desktop" | "mobile";

function getDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function isMetaMaskAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask;
}

function isInMetaMaskMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const eth = (window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum;
  return !!(eth?.isMetaMask) && getDevice() === "mobile";
}

export default function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [showNoMMModal, setShowNoMMModal] = useState(false);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDevice(getDevice());
  }, []);

  function handleConnect() {
    if (!mounted) return;
    if (!isMetaMaskAvailable()) {
      setShowNoMMModal(true);
      return;
    }
    const mm = connectors.find(c => c.id === "metaMask" || c.name === "MetaMask" || c.id === "injected");
    if (mm) connect({ connector: mm });
  }

  const mmDeepLink = `https://metamask.app.link/dapp/${typeof window !== "undefined" ? window.location.host + window.location.pathname : ""}`;

  if (isConnected) {
    return (
      <>
        <NetworkGuard />
        <Topbar />
        <main className="pt-14 pb-20">{children}</main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: "#0d0c0b" }}>
        {/* Minimal header */}
        <div className="flex items-center gap-2 px-5" style={{ height: 56, borderBottom: "1px solid var(--bd)" }}>
          <span className="text-acc font-bold tracking-[4px] text-[17px]">👻</span>
          <div style={{ width: 1, height: 22, background: "var(--bd2)", flexShrink: 0 }} />
          <span className="text-[10px] text-acc3 tracking-[1px] px-2 py-1 rounded border"
            style={{ borderColor: "var(--bd)" }}>RITUAL TESTNET</span>
        </div>

        <div className="flex-1 flex flex-col px-5 py-10">
          {/* Brand */}
          <div className="text-center mb-10">
            <div className="text-[38px] font-bold tracking-[8px] text-acc mb-2">ZK-RITUAL</div>
            <div className="text-[9px] text-acc3 tracking-[2.5px]">
              ON-CHAIN REPUTATION · RITUAL PROOF NETWORK
            </div>
          </div>

          {/* Connect section */}
          <div className="flex flex-col items-center mb-10">
            <div className="text-[9px] text-acc3 tracking-[2px] text-center mb-4">
              CONNECT WALLET TO GET STARTED
            </div>

            <button onClick={handleConnect} disabled={isPending} style={{
              width: "100%", maxWidth: 320,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 20px", borderRadius: 12,
              background: isPending ? "rgba(255,252,248,0.03)" : "rgba(255,252,248,0.05)",
              border: "1px solid var(--bd3)",
              cursor: isPending ? "not-allowed" : "pointer", transition: "background 0.2s",
            }}>
              <svg width="22" height="22" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
                <polygon fill="#e2761b" points="274.1,35.5 174.6,109.4 193,65.8"/>
                <polygon fill="#e4761b" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
                <polygon fill="#d7c1b3" points="238.3,206.8 211.8,247.4 269.1,263.5 285.9,207.7"/>
                <polygon fill="#d7c1b3" points="32.8,207.7 49.5,263.5 106.8,247.4 80.3,206.8"/>
                <polygon fill="#d7c1b3" points="103.6,138.2 87.5,162.1 144.4,164.6 142.5,103.3"/>
                <polygon fill="#d7c1b3" points="214.9,138.2 175.9,102.5 174.6,164.6 231.4,162.1"/>
                <polygon fill="#233447" points="106.8,247.4 141,230.5 111.4,208.1"/>
                <polygon fill="#233447" points="177.6,230.5 211.8,247.4 207.1,208.1"/>
                <polygon fill="#cd6116" points="211.8,247.4 177.6,230.5 180.3,252.1 180,262.5"/>
                <polygon fill="#cd6116" points="106.8,247.4 138.6,262.5 138.4,252.1 141,230.5"/>
                <polygon fill="#e4751f" points="138.8,193.5 110.6,185.2 130.5,176.1"/>
                <polygon fill="#e4751f" points="179.8,193.5 187.9,176.1 207.9,185.2"/>
                <polygon fill="#f6851b" points="106.8,247.4 111.6,206.8 80.3,207.7"/>
                <polygon fill="#f6851b" points="207.1,206.8 211.8,247.4 238.3,207.7"/>
                <polygon fill="#f6851b" points="231.4,162.1 174.6,164.6 179.8,193.5 207.9,185.2"/>
                <polygon fill="#f6851b" points="87.5,162.1 106.8,185.2 144.4,164.6 87.5,162.1"/>
                <polygon fill="#c0ad9e" points="87.5,162.1 111.4,208.1 110.6,185.2"/>
                <polygon fill="#c0ad9e" points="207.9,185.2 207.1,208.1 231.4,162.1"/>
                <polygon fill="#c0ad9e" points="144.4,164.6 138.8,193.5 146.5,232.3 148.2,182.4"/>
                <polygon fill="#c0ad9e" points="174.6,164.6 170.5,182.3 171.9,232.3 179.8,193.5"/>
                <polygon fill="#e4761b" points="179.8,193.5 171.9,232.3 177.6,230.5 207.1,208.1 207.9,185.2"/>
                <polygon fill="#e4761b" points="110.6,185.2 111.4,208.1 141,230.5 146.5,232.3 138.8,193.5"/>
                <polygon fill="#f6851b" points="180,262.5 180.3,252.1 177.8,249.9 140.8,249.9 138.4,252.1 138.6,262.5 106.8,247.4 117.8,256.4 140.5,271.9 178.1,271.9 200.9,256.4 211.8,247.4"/>
                <polygon fill="#c0ad9e" points="177.6,230.5 171.9,232.3 146.5,232.3 141,230.5 138.4,252.1 140.8,249.9 177.8,249.9 180.3,252.1"/>
              </svg>
              <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:13, color:"#f2ede6", letterSpacing:"0.5px" }}>
                {isPending ? "CONNECTING..." : "Connect MetaMask"}
              </span>
            </button>

            <div className="text-[9px] text-acc3 text-center mt-3" style={{ letterSpacing:"0.5px" }}>
              MetaMask only · Ritual Testnet
            </div>
          </div>

          {/* How it works */}
          <div className="w-full">
            <div className="label mb-3">HOW IT WORKS</div>
            {[
              { icon:"🔗", t:"Connect Wallet",  d:"MetaMask only — Ritual Testnet activity fetched in real time" },
              { icon:"🎖️", t:"Claim Badges",    d:"Meet criteria → click Claim Badge → ERC-721 minted on-chain" },
              { icon:"⭐", t:"Earn Points",     d:"Each badge = 10 points · Daily check-in = 5 points" },
            ].map(({ icon, t, d }) => (
              <div key={t} className="flex gap-3 p-4 rounded-xl mb-2"
                style={{ background:"#171615", border:"1px solid var(--bd)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background:"rgba(255,252,248,0.05)", border:"1px solid var(--bd2)" }}>{icon}</div>
                <div>
                  <div className="text-[13px] font-bold text-acc mb-1" style={{ fontFamily:"'Rajdhani',sans-serif" }}>{t}</div>
                  <div className="text-[10px] text-acc3 leading-relaxed">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MetaMask Not Installed Modal ── */}
      {showNoMMModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{
            background: "#1a1917", borderRadius: 20, padding: "32px 24px",
            maxWidth: 340, width: "100%", textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🦊</div>

            <div style={{
              fontFamily: "'Space Mono',monospace", fontWeight: 700,
              fontSize: 16, letterSpacing: "2px", color: "#f2ede6",
              textTransform: "uppercase", marginBottom: 12,
            }}>
              METAMASK REQUIRED
            </div>

            {device === "mobile" ? (
              <>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 20 }}>
                  Open this dApp inside the MetaMask mobile app browser, or install MetaMask to continue.
                </div>
                <a href={mmDeepLink} style={{
                  display: "block", width: "100%", padding: "13px 20px",
                  borderRadius: 12, marginBottom: 10,
                  background: "linear-gradient(135deg,#6c2ed4,#8b45e8)",
                  color: "#fff", fontFamily: "'Space Mono',monospace",
                  fontWeight: 700, fontSize: 13, letterSpacing: "0.5px",
                  textDecoration: "none", cursor: "pointer",
                }}>
                  Open in MetaMask App
                </a>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{
                  display: "block", width: "100%", padding: "11px 20px",
                  borderRadius: 12, marginBottom: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#d6d0c8", fontFamily: "'Space Mono',monospace",
                  fontWeight: 700, fontSize: 12, letterSpacing: "0.5px",
                  textDecoration: "none", cursor: "pointer",
                }}>
                  Download MetaMask
                </a>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 20 }}>
                  Please install the MetaMask browser extension and reload the page.
                </div>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{
                  display: "block", width: "100%", padding: "13px 20px",
                  borderRadius: 12, marginBottom: 12,
                  background: "linear-gradient(135deg,#6c2ed4,#8b45e8)",
                  color: "#fff", fontFamily: "'Space Mono',monospace",
                  fontWeight: 700, fontSize: 13, letterSpacing: "0.5px",
                  textDecoration: "none", cursor: "pointer",
                }}>
                  Install MetaMask Extension
                </a>
              </>
            )}

            <button onClick={() => setShowNoMMModal(false)} style={{
              width: "100%", padding: "11px 20px", borderRadius: 12,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#7a7570", fontFamily: "'Space Mono',monospace",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
