"use client";
import { useAccount } from "wagmi";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useBadges } from "@/hooks/useBadges";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState, useRef, useCallback } from "react";
import { getLeaderboard, LeaderboardRow } from "@/lib/firebase";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Skeleton } from "@/components/ui/Skeleton";
import GlobalLoader from "@/components/ui/GlobalLoader";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { profile, loading: profileLoading }  = useProfile(address);
  const { streak, canCheckIn, doCheckIn, isCheckingIn, txPending, txSuccess, isContractLoading } = useCheckIn(address);
  const { badges, totalPoints, claimSuccess } = useBadges(address, profile || undefined, streak);
  const earned = badges.filter(b => b.earned).length;

  const [board, setBoard]             = useState<LeaderboardRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [userRank, setUserRank]       = useState<number | null>(null);
  const [toastMsg, setToastMsg]       = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Track previous totalPoints so we only re-fetch leaderboard when it actually changes
  const prevTotalPoints = useRef<number | null>(null);

  const fetchLeaderboard = useCallback((addr?: string) => {
    setBoardLoading(true);
    getLeaderboard(10).then(b => {
      setBoard(b);
      const a = addr || address;
      if (a) {
        const idx = b.findIndex(r => r.address === a.toLowerCase());
        setUserRank(idx >= 0 ? idx + 1 : b.length + 1);
      }
    }).catch(() => {}).finally(() => setBoardLoading(false));
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load and when address changes
  useEffect(() => {
    prevTotalPoints.current = null;
    fetchLeaderboard(address);
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instant leaderboard refresh after check-in confirms
  useEffect(() => {
    if (!txSuccess) return;
    setToastMsg(`🔥 Day ${streak} streak! +5 PTS earned`);
    setTimeout(() => setToastMsg(""), 5000);
    // Give Firebase 1.5s to settle then refresh
    const t = setTimeout(() => fetchLeaderboard(), 1500);
    return () => clearTimeout(t);
  }, [txSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Instant leaderboard refresh after badge claim confirms
  useEffect(() => {
    if (claimSuccess === null) return;
    const t = setTimeout(() => fetchLeaderboard(), 1500);
    return () => clearTimeout(t);
  }, [claimSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh leaderboard whenever totalPoints changes (catches any other source of change)
  useEffect(() => {
    if (prevTotalPoints.current === null) {
      prevTotalPoints.current = totalPoints;
      return;
    }
    if (totalPoints !== prevTotalPoints.current) {
      prevTotalPoints.current = totalPoints;
      const t = setTimeout(() => fetchLeaderboard(), 800);
      return () => clearTimeout(t);
    }
  }, [totalPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = profile?.username || (address ? `${address.slice(0,6)}...${address.slice(-4)}` : "");
  const medals = ["🥇","🥈","🥉"];

  const btnLabel = isCheckingIn || txPending
    ? "⏳ CONFIRMING TX..."
    : isContractLoading && isConnected
    ? "LOADING..."
    : canCheckIn
    ? "CHECK IN 🔥 +5 PTS"
    : "✓ DONE TODAY";

  const checkinMsg = !isConnected
    ? "Connect wallet to start your streak"
    : isCheckingIn || txPending
    ? "Transaction submitted — waiting for confirmation..."
    : txSuccess
    ? `✅ Day ${streak} complete! +5 PTS earned`
    : isContractLoading
    ? "Loading streak data..."
    : canCheckIn
    ? streak > 0 ? `Current streak: ${streak} days — keep it up!` : "Start your streak today!"
    : `Day ${streak} complete — come back tomorrow`;

  function handleCheckInClick() {
    if (!isConnected || !canCheckIn || isCheckingIn || txPending) return;
    setConfirmOpen(true);
  }

  async function handleCheckInConfirm() {
    setConfirmOpen(false);
    await doCheckIn();
  }

  const isLoading = isConnected && (profileLoading || isContractLoading);

  return (
    <div>
      <GlobalLoader loading={isLoading} label="LOADING DATA..." />
      <ConfirmModal
        open={confirmOpen}
        title="DAILY CHECK-IN"
        message={`Confirm your Day ${streak + 1} check-in. This submits a transaction on Ritual Testnet to record your streak on-chain. You'll earn +5 PTS. You'll need to approve it in MetaMask.`}
        confirmLabel="CHECK IN 🔥"
        onConfirm={handleCheckInConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Hero */}
      <div className="text-center px-5 py-7" style={{ borderBottom:"1px solid var(--bd)" }}>
        <div className="text-[32px] font-bold tracking-[8px] text-acc mb-1">ZK-RITUAL</div>
        <div className="text-[9px] text-acc3 tracking-[2.5px] mb-5">ON-CHAIN REPUTATION · RITUAL PROOF NETWORK</div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{ v:earned, l:"BADGES" }, { v:totalPoints, l:"POINTS" }, { v:streak, l:"DAY STREAK" }].map(({v,l}) => (
            <div key={l} className="rounded-xl py-3" style={{ background:"#171615", border:"1px solid var(--bd)" }}>
              <div className="text-[22px] font-bold text-acc leading-none mb-1">{v}</div>
              <div className="text-[8px] text-acc3 tracking-[0.5px]">{l}</div>
            </div>
          ))}
        </div>

        {/* Daily Check-in */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
          style={{ background:"#1e1d1c", border:"1px solid var(--bd2)" }}>
          <div className="flex-1">
            <div className="text-[9px] text-acc3 tracking-[2px] mb-1">DAILY CHECK-IN · +5 PTS</div>
            <div className="text-[11px] text-acc2">{checkinMsg}</div>
          </div>
          <button onClick={handleCheckInClick}
            disabled={!isConnected || !canCheckIn || isCheckingIn || txPending || isContractLoading}
            className="px-3 py-2 rounded-lg text-[9px] font-bold flex-shrink-0"
            style={{
              background: (canCheckIn && isConnected && !isCheckingIn && !txPending && !isContractLoading)
                ? "var(--green-dim)" : "rgba(255,252,248,0.04)",
              border: (canCheckIn && isConnected && !isCheckingIn && !txPending && !isContractLoading)
                ? "1px solid var(--green-dim3)" : "1px solid var(--bd)",
              color: (canCheckIn && isConnected && !isCheckingIn && !txPending && !isContractLoading)
                ? "#4ade80" : "#7a7570",
              cursor: (!canCheckIn || !isConnected || isCheckingIn || txPending || isContractLoading) ? "default" : "pointer",
            }}>
            {btnLabel}
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-5 pb-6 pt-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background:"var(--bd)" }} />
          <div className="label">LEADERBOARD</div>
          <div className="flex-1 h-px" style={{ background:"var(--bd)" }} />
        </div>

        {/* Current user position */}
        {isConnected && (
          <div className="flex items-center gap-3 p-3 rounded-xl mb-4 relative"
            style={{ background:"#1e1d1c", border:"1px solid var(--bd3)" }}>
            <div className="absolute top-1.5 right-3 text-[7px] text-acc3 tracking-widest">YOUR POSITION</div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold text-acc2"
              style={{ background:"rgba(255,252,248,0.06)", border:"1px solid var(--bd2)" }}>
              #{userRank ?? "—"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-bold text-acc">YOU</div>
                {displayName && (
                  <div className="text-[9px] text-acc3 truncate">· {displayName}</div>
                )}
              </div>
              <div className="text-[9px] text-acc3">{earned} badge{earned !== 1 ? "s" : ""} earned</div>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-bold text-acc">⬡ {totalPoints}</div>
              <div className="text-[8px] text-acc3 tracking-wide">POINTS</div>
            </div>
          </div>
        )}

        {/* Top 10 */}
        <div className="flex flex-col gap-1.5">
          {boardLoading ? (
            <>{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</>
          ) : board.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-acc3">No entries yet — claim your first badge!</div>
          ) : (
            board.slice(0,10).map((row, i) => {
              const isYou = row.address.toLowerCase() === address?.toLowerCase();
              const name  = row.username || `${row.address.slice(0,6)}...${row.address.slice(-4)}`;
              return (
                <div key={row.address} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: isYou ? "rgba(255,252,248,0.04)":"#171615",
                    border:`1px solid ${isYou?"var(--bd3)":"var(--bd)"}` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold"
                    style={{
                      background: i<3 ? ["rgba(212,175,55,.15)","rgba(192,192,192,.12)","rgba(205,127,50,.12)"][i] : "rgba(255,252,248,0.04)",
                      color:      i<3 ? ["#d4af37","#c0c0c0","#cd7f32"][i] : "#7a7570",
                      fontSize:   i<3 ? 15 : 11,
                    }}>
                    {i < 3 ? medals[i] : i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-acc truncate">
                      {isYou ? "YOU" : name}
                      {isYou && <span className="ml-2 text-[8px] text-acc3">· {name}</span>}
                    </div>
                    <div className="text-[8px] text-acc3">{row.badges_earned} badge{row.badges_earned!==1?"s":""}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-acc2">⬡ {row.total_points}</div>
                    <div className="text-[8px] text-acc3">POINTS</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl z-50 text-[12px] font-bold"
          style={{ background:"rgba(5,46,22,0.95)", border:"2px solid rgba(34,197,94,0.6)",
            color:"#4ade80", whiteSpace:"nowrap" }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
