"use client";
import { useAccount } from "wagmi";
import { useBadges } from "@/hooks/useBadges";
import { useProfile } from "@/hooks/useProfile";
import { useCheckIn } from "@/hooks/useCheckIn";
import BadgeCard from "@/components/badge/BadgeCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { PageSkeleton } from "@/components/ui/Skeleton";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { useState } from "react";

export default function BadgePage() {
  const { address, isConnected } = useAccount();
  const { profile, loading: profileLoading } = useProfile(address);
  const { streak, isContractLoading }        = useCheckIn(address);
  const { badges, totalPoints, claimBadge, claimingId, claimSuccess, activity } =
    useBadges(address, profile || undefined, streak);

  const [toast, setToast]         = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const earned = badges.filter(b => b.earned).length;

  // Only show un-earned badges
  const unearned = badges.filter(b => !b.earned);

  const badgesLoading = isConnected && badges.every(b => !b.earned && !b.eligible && activity.txCount === 0);

  function handleClaimClick(id: number) { setConfirmId(id); }

  async function handleClaimConfirm() {
    if (confirmId === null) return;
    const id = confirmId;
    setConfirmId(null);
    try {
      await claimBadge(id);
    } catch (e: unknown) {
      const msg = (e as Error).message || "Transaction failed";
      setToast(`❌ ${msg.includes("User rejected") ? "Transaction rejected" : msg.slice(0, 60)}`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  const confirmBadge = confirmId !== null ? badges.find(b => b.id === confirmId) : null;
  const isLoading = isConnected && (profileLoading || isContractLoading);

  return (
    <div>
      <GlobalLoader loading={isLoading} label="LOADING BADGES..." />
      <ConfirmModal
        open={confirmId !== null}
        title={`CLAIM BADGE — ${confirmBadge?.name ?? ""}`}
        message={`This will mint "${confirmBadge?.name}" as an ERC-721 token on Ritual Testnet and add ${confirmBadge?.pts ?? 10} points to your score. You'll need to approve the transaction in MetaMask.`}
        confirmLabel="CLAIM BADGE 🎖️"
        onConfirm={handleClaimConfirm}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom:"1px solid var(--bd)" }}>
        <span className="label">BADGES</span>
        <span className="text-[9px] px-2 py-1 rounded-md font-bold text-acc2"
          style={{ background:"rgba(255,252,248,0.06)", border:"1px solid var(--bd2)" }}>
          {earned} / {badges.length} EARNED
        </span>
        <div className="flex-1" />
        <span className="text-[9px] text-acc3">TOTAL <span className="text-acc font-bold">{totalPoints}</span> PTS</span>
      </div>

      {/* Activity bar — wallet age removed */}
      {isConnected && (
        <div className="flex gap-3 px-4 py-2 text-[9px] text-acc3"
          style={{ borderBottom:"1px solid var(--bd)", background:"rgba(255,252,248,0.02)" }}>
          <span>Balance: <b className="text-acc">{activity.balance.toFixed(3)} RITUAL</b></span>
          <span>·</span>
          <span>TXs: <b className="text-acc">{activity.txCount}</b></span>
        </div>
      )}

      {/* Badge grid — earned badges hidden (they live in Profile) */}
      {badgesLoading && isConnected ? (
        <PageSkeleton />
      ) : (
        <div className="grid gap-3 px-5 py-5" style={{ gridTemplateColumns:"repeat(2,1fr)" }}>
          {unearned.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onClaim={handleClaimClick}
              claimingId={claimingId}
              claimSuccess={claimSuccess}
              isConnected={isConnected}
            />
          ))}

          {/* Bug 3 fix: height 290px + full brightness (opacity 1) */}
          <div className="relative flex flex-col items-center rounded-xl overflow-hidden"
            style={{
              background:"linear-gradient(155deg,#071410 0%,#040e0a 55%,#071612 100%)",
              border:"1px solid rgba(34,197,94,0.10)", padding:"12px 10px 10px",
              height: 290, opacity: 1,
            }}>
            <div className="text-[8px] text-center mb-1" style={{ color:"rgba(34,197,94,0.3)", letterSpacing:"1.8px" }}>COMING SOON</div>
            <div className="flex-1 flex items-center justify-center text-4xl">🔒</div>
            <div className="w-full text-center rounded-md py-1.5"
              style={{ background:"rgba(5,46,22,0.5)", fontSize:11, fontFamily:"'Rajdhani',sans-serif",
                fontWeight:700, color:"rgba(74,222,128,0.3)", textTransform:"uppercase" }}>
              COMING SOON
            </div>
          </div>
        </div>
      )}

      {claimSuccess !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl z-50 text-center"
          style={{ background:"rgba(5,46,22,0.95)", border:"2px solid rgba(34,197,94,0.6)", color:"#4ade80",
            fontSize:12, fontWeight:700, whiteSpace:"nowrap", letterSpacing:"0.5px" }}>
          🎉 Badge claimed on-chain! +10 PTS — check your Profile
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl z-50"
          style={{ background:"#252422", border:"1px solid var(--bd3)", color:"#d6d0c8",
            fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
