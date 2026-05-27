"use client";
import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { useBadges } from "@/hooks/useBadges";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useEffect, useState, useCallback } from "react";
import { getLeaderboard } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/Skeleton";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { TIERS, DEFAULT_TIER } from "@/components/badge/BadgeCard";

const LOGOS: Record<string, string> = {
  beginner: "/badges/Profiel.png",
  tx10:     "/badges/10 Transaction Badge.png",
  tx50:     "/badges/50 Tranasaction Badge.png",
  balance:  "/badges/Balance Badge.png",
  streak:   "/badges/30 Days Check Badge.png",
  x:        "/badges/Twitter Badge.png",
  discord:  "/badges/Discord Badge.png",
};

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { profile, loading: profileLoading, saveUsername, saveSocial } = useProfile(address);
  const { streak, txSuccess, isContractLoading } = useCheckIn(address);
  const { badges, totalPoints, claimSuccess }    = useBadges(address, profile || undefined, streak);
  const earned = badges.filter(b => b.earned);

  const [unameInput, setUnameInput] = useState("");
  const [unameError, setUnameError] = useState("");
  const [savingUname, setSavingUname] = useState(false);
  const [xInput,  setXInput]  = useState("");
  const [dcInput, setDcInput] = useState("");
  const [savingX,  setSavingX]  = useState(false);
  const [savingDc, setSavingDc] = useState(false);
  const [toast, setToast] = useState("");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (profile.twitter && !xInput)  setXInput(profile.twitter);
    if (profile.discord && !dcInput) setDcInput(profile.discord);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRank = useCallback((addr?: string) => {
    const a = addr || address;
    if (!a) return;
    setRankLoading(true);
    getLeaderboard(100).then(board => {
      const idx = board.findIndex(r => r.address === a.toLowerCase());
      setUserRank(idx >= 0 ? idx + 1 : board.length + 1);
    }).catch(() => {}).finally(() => setRankLoading(false));
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial rank fetch
  useEffect(() => {
    if (!address) return;
    fetchRank(address);
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instant rank refresh after check-in confirms
  useEffect(() => {
    if (!txSuccess) return;
    const t = setTimeout(() => fetchRank(), 1500);
    return () => clearTimeout(t);
  }, [txSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instant rank refresh after badge claim confirms
  useEffect(() => {
    if (claimSuccess === null) return;
    const t = setTimeout(() => fetchRank(), 1500);
    return () => clearTimeout(t);
  }, [claimSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also refresh when totalPoints changes (catches any other source)
  useEffect(() => {
    if (!address || totalPoints === 0) return;
    const t = setTimeout(() => fetchRank(), 800);
    return () => clearTimeout(t);
  }, [totalPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3500); }

  // Bug 5 fix: always show short address, never the full address
  const shortAddr   = address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Not connected";
  const displayName = profile?.username || shortAddr;

  async function handleSaveUsername() {
    if (!unameInput.trim()) return;
    setSavingUname(true); setUnameError("");
    const err = await saveUsername(unameInput.trim());
    setSavingUname(false);
    if (err) { setUnameError(err); return; }
    showToast("✅ Username saved!");
  }

  async function handleSaveX() {
    if (!xInput.trim()) return;
    setSavingX(true);
    await saveSocial("twitter", xInput.trim());
    setSavingX(false);
    showToast("✅ X account linked!");
  }

  async function handleSaveDc() {
    if (!dcInput.trim()) return;
    setSavingDc(true);
    await saveSocial("discord", dcInput.trim());
    setSavingDc(false);
    showToast("✅ Discord linked!");
  }

  const isLoading = isConnected && (profileLoading || isContractLoading);

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <GlobalLoader loading={isLoading} label="LOADING PROFILE..." />

      {/* Wallet Card */}
      <div className="rounded-2xl p-6 text-center" style={{ background:"#171615", border:"1px solid var(--bd2)" }}>
        <div className="mx-auto mb-3 rounded-full flex items-center justify-center overflow-hidden"
          style={{ width:72, height:72, background:"rgba(255,252,248,0.05)", border:"2px solid var(--bd3)" }}>
          <img src="/badges/Profiel.png" alt="avatar"
            style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }}
            onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
        </div>
        <div className="text-[15px] font-bold text-acc mb-1">{displayName}</div>
        {/* Short address only */}
        <div className="text-[10px] text-acc3 mb-1 truncate px-4">{shortAddr}</div>
        <div className="text-[10px] text-acc3">Connected · Ritual Testnet</div>
        <div className="h-px my-4" style={{ background:"var(--bd)" }} />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-[24px] font-bold text-acc leading-none mb-1">{earned.length}</div>
            <div className="text-[9px] text-acc3">BADGES</div>
          </div>
          <div>
            <div className="text-[24px] font-bold text-acc leading-none mb-1">{totalPoints}</div>
            <div className="text-[9px] text-acc3">POINTS</div>
          </div>
          <div>
            {rankLoading ? <Skeleton className="h-7 w-12 mx-auto mb-1" /> :
              <div className="text-[24px] font-bold text-acc leading-none mb-1">#{userRank ?? "—"}</div>}
            <div className="text-[9px] text-acc3">RANK</div>
          </div>
        </div>
      </div>

      {/* SET USERNAME */}
      {!profile?.username && (
        <div className="rounded-2xl p-5 relative" style={{ background:"#171615", border:"1px solid var(--bd2)" }}>
          <div className="absolute top-2 right-3 text-[7px] text-acc3 tracking-widest">ONE TIME SETUP</div>
          <div className="label mb-3">SET USERNAME</div>
          {profileLoading ? <Skeleton className="h-10 rounded-xl" /> : (
            <div>
              <div className="flex gap-2">
                <input value={unameInput} onChange={e => setUnameInput(e.target.value)}
                  placeholder="choose a username" maxLength={20} disabled={!isConnected || profileLoading}
                  onKeyDown={e => e.key === "Enter" && handleSaveUsername()}
                  className="flex-1 rounded-xl px-3 py-2.5 text-[12px] text-acc outline-none"
                  style={{ background:"#111010", border:"1px solid var(--bd2)", fontFamily:"'Space Mono',monospace" }} />
                <button onClick={handleSaveUsername} disabled={!isConnected || savingUname || !unameInput}
                  className="px-4 py-2.5 rounded-xl text-[10px] font-bold"
                  style={{ background:"rgba(255,252,248,0.05)", border:"1px solid var(--bd3)", color:"#d6d0c8" }}>
                  {savingUname ? "..." : "SAVE"}
                </button>
              </div>
              {unameError && <div className="text-[10px] text-red-400 mt-2">{unameError}</div>}
              <div className="text-[9px] text-acc3 mt-2">One-time only — hides wallet address everywhere</div>
            </div>
          )}
        </div>
      )}

      {/* Social Links */}
      <div className="rounded-2xl p-5" style={{ background:"#171615", border:"1px solid var(--bd)" }}>
        <div className="label mb-4">LINK SOCIALS · EARN BADGES</div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background:"#1e1d1c", border:"1px solid var(--bd)" }}>𝕏</div>
          {profile?.twitter ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[12px] text-acc2 flex-1">{profile.twitter}</span>
              <span className="text-[8px] px-2 py-1 rounded font-bold"
                style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:"#4ade80" }}>LINKED ✓</span>
            </div>
          ) : (
            <>
              <input value={xInput} onChange={e => setXInput(e.target.value)} placeholder="@username"
                maxLength={40} disabled={!isConnected}
                className="flex-1 rounded-xl px-3 py-2.5 text-[12px] text-acc outline-none"
                style={{ background:"#111010", border:"1px solid var(--bd2)", fontFamily:"'Space Mono',monospace" }} />
              <button onClick={handleSaveX} disabled={!isConnected || savingX || !xInput}
                className="px-3 py-2.5 rounded-xl text-[10px] font-bold flex-shrink-0"
                style={{ background:"rgba(255,252,248,0.05)", border:"1px solid var(--bd3)", color:"#d6d0c8" }}>
                {savingX ? "..." : "SAVE"}
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background:"#1e1d1c", border:"1px solid var(--bd)" }}>💬</div>
          {profile?.discord ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[12px] text-acc2 flex-1">{profile.discord}</span>
              <span className="text-[8px] px-2 py-1 rounded font-bold"
                style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", color:"#4ade80" }}>LINKED ✓</span>
            </div>
          ) : (
            <>
              <input value={dcInput} onChange={e => setDcInput(e.target.value)} placeholder="username#0000"
                maxLength={40} disabled={!isConnected}
                className="flex-1 rounded-xl px-3 py-2.5 text-[12px] text-acc outline-none"
                style={{ background:"#111010", border:"1px solid var(--bd2)", fontFamily:"'Space Mono',monospace" }} />
              <button onClick={handleSaveDc} disabled={!isConnected || savingDc || !dcInput}
                className="px-3 py-2.5 rounded-xl text-[10px] font-bold flex-shrink-0"
                style={{ background:"rgba(255,252,248,0.05)", border:"1px solid var(--bd3)", color:"#d6d0c8" }}>
                {savingDc ? "..." : "SAVE"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── MY BADGES — flat single row, no category grouping ── */}
      <div className="rounded-2xl p-5" style={{ background:"#171615", border:"1px solid var(--bd)" }}>
        <div className="label mb-4">MY BADGES · {earned.length} EARNED</div>

        {earned.length === 0 ? (
          <div className="text-[11px] italic text-acc3 py-2">No badges yet — claim your first badge!</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {earned.map(b => {
              const t = TIERS[b.key] ?? DEFAULT_TIER;
              return (
                <div key={b.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    border: `2.5px solid ${t.border}`,
                    boxShadow: `0 0 14px 4px ${t.glow}`,
                    overflow: "hidden", background: "#0a0e14",
                    flexShrink: 0,
                  }}>
                    {LOGOS[b.key] && (
                      <img src={LOGOS[b.key]} alt={b.name}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: 8, color: t.text, textAlign: "center",
                    fontWeight: 700, letterSpacing: "0.3px",
                    maxWidth: 66, lineHeight: 1.3,
                  }}>
                    {b.name}
                  </div>
                  <div style={{
                    fontSize: 6, fontWeight: 700, letterSpacing: "1px",
                    padding: "1px 7px", borderRadius: 20,
                    background: t.glow, border: `1px solid ${t.border}`,
                    color: t.text, textTransform: "uppercase",
                  }}>
                    {t.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl z-50 text-[12px] font-bold"
          style={{ background:"#1e1d1c", border:"1px solid var(--bd3)", color:"#d6d0c8", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
