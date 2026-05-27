"use client";
import { useReadContract, useWriteContract } from "wagmi";
import { BADGE_ABI, BADGE_CONTRACT, BADGES } from "@/lib/contracts";
import { useWalletActivity } from "./useWalletActivity";
import { syncStatsToFirebase } from "@/lib/syncStats";
import { useCallback, useState, useEffect, useRef } from "react";

export interface BadgeState {
  id: number; key: string; name: string; criteria: string; pts: number;
  earned: boolean; eligible: boolean;
}

async function waitForTxViaMetaMask(hash: string, maxAttempts = 90): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const receipt = await (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum?.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      }) as { blockNumber?: string; status?: string } | null;
      if (receipt?.blockNumber) {
        if (receipt.status === "0x0") throw new Error("Transaction reverted on-chain");
        return;
      }
    } catch (e) {
      if ((e as Error).message?.includes("reverted")) throw e;
    }
  }
  throw new Error("Transaction confirmation timed out after 3 minutes");
}

export function useBadges(
  address?: `0x${string}`,
  profile?: { twitter?: string | null; discord?: string | null },
  streak?: number
) {
  const activity = useWalletActivity(address);
  const [claimingId,   setClaimingId]   = useState<number | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<number | null>(null);
  const [txPending,    setTxPending]    = useState(false);
  const [pendingTx,    setPendingTx]    = useState<string | undefined>(undefined);

  const contractReady =
    !!BADGE_CONTRACT && BADGE_CONTRACT !== "0x0000000000000000000000000000000000000000";

  const addressRef    = useRef(address);
  const claimingIdRef = useRef(claimingId);
  useEffect(() => { addressRef.current    = address;    }, [address]);
  useEffect(() => { claimingIdRef.current = claimingId; }, [claimingId]);

  // Earned badges — read from blockchain
  const { data: earnedBadges, refetch: refetchBadges } = useReadContract({
    abi: BADGE_ABI, address: BADGE_CONTRACT,
    functionName: "getUserBadges",
    args:  address ? [address] : undefined,
    query: { enabled: !!address && contractReady },
  });

  // Badge points — read from blockchain
  const { data: onChainPoints, refetch: refetchPoints } = useReadContract({
    abi: BADGE_ABI, address: BADGE_CONTRACT,
    functionName: "totalPoints",
    args:  address ? [address] : undefined,
    query: { enabled: !!address && contractReady },
  });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (!pendingTx) return;
    let cancelled = false;
    setTxPending(true);

    waitForTxViaMetaMask(pendingTx)
      .then(async () => {
        if (cancelled) return;
        setTxPending(false);
        setPendingTx(undefined);

        const addr      = addressRef.current;
        const claimedId = claimingIdRef.current;

        // Refetch wagmi cache so UI reflects new earned badges immediately
        await Promise.all([refetchBadges(), refetchPoints()]);

        if (addr) {
          try {
            // Read fresh totals from blockchain and update leaderboard cache only
            await syncStatsToFirebase(addr);
          } catch (err) {
            console.error("[useBadges] post-confirm sync failed:", err);
          }
        }

        if (claimedId !== null) {
          setClaimSuccess(claimedId);
          setTimeout(() => { if (!cancelled) setClaimSuccess(null); }, 6_000);
          setClaimingId(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[useBadges] tx failed:", err);
          setTxPending(false);
          setClaimingId(null);
          setPendingTx(undefined);
        }
      });

    return () => { cancelled = true; };
  }, [pendingTx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Eligibility shown on website — contract enforces the same rules on-chain
  function isEligible(id: number): boolean {
    if (!address) return false;
    switch (id) {
      case 0: return true;                           // Beginner — always
      case 1: return activity.txCount >= 10;         // 10+ check-ins (via nonce)
      case 2: return activity.txCount >= 50;         // 50+ check-ins (via nonce)
      case 3: return activity.balance >= 5;          // 5+ ETH — also enforced on-chain
      case 4: return (streak || 0) >= 30;            // 30-day streak — also enforced on-chain
      case 5: return !!profile?.twitter;             // X — website only
      case 6: return !!profile?.discord;             // Discord — website only
      default: return false;
    }
  }

  const badges: BadgeState[] = BADGES.map((b, i) => ({
    ...b,
    // Earned status comes directly from blockchain
    earned:   Array.from((earnedBadges as readonly boolean[] | undefined) ?? [])[i] ?? false,
    eligible: isEligible(b.id),
  }));

  // Total points = badge pts (blockchain) + streak pts (blockchain) — shown as one number
  const onChainBadgePts = onChainPoints ? Number(onChainPoints) : 0;
  const checkInPts      = (streak || 0) * 5;
  const totalPoints     = onChainBadgePts + checkInPts;

  const claimBadge = useCallback(async (badgeId: number) => {
    if (!address) return;
    setClaimingId(badgeId);
    try {
      const hash = await writeContractAsync({
        abi: BADGE_ABI, address: BADGE_CONTRACT,
        functionName: "claimBadge", args: [badgeId],
      });
      setPendingTx(hash);
    } catch (e) {
      console.error("[useBadges] write failed:", e);
      setClaimingId(null);
      throw e;
    }
  }, [address, writeContractAsync]);

  return {
    badges,
    totalPoints,
    activity,
    claimBadge,
    claimingId,
    txPending,
    claimSuccess,
  };
}
