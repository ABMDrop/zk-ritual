"use client";
import { useReadContract, useWriteContract } from "wagmi";
import { CHECKIN_ABI, CHECKIN_CONTRACT } from "@/lib/contracts";
import { syncStatsToFirebase } from "@/lib/syncStats";
import { getLastCheckinDate } from "@/lib/firebase";
import { useState, useCallback, useEffect, useRef } from "react";

// ─── helpers ────────────────────────────────────────────────────
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// localStorage — instant, same browser
function lsKey(address: string) { return `zk_ci_${address.toLowerCase()}_${todayStr()}`; }
function lsMarkDone(address: string) { try { localStorage.setItem(lsKey(address),"1"); } catch {} }
function lsIsDone(address: string): boolean { try { return !!localStorage.getItem(lsKey(address)); } catch { return false; } }

async function waitForReceipt(hash: string, maxAttempts = 90): Promise<void> {
  const eth = (window as Window & { ethereum?: { request: (a: {method: string; params?: unknown[]}) => Promise<unknown> } }).ethereum;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const rx = await eth?.request({ method: "eth_getTransactionReceipt", params: [hash] }) as { blockNumber?: string; status?: string } | null;
      if (rx?.blockNumber) {
        if (rx.status === "0x0") throw new Error("Transaction reverted on-chain");
        return;
      }
    } catch (e) {
      if ((e as Error).message?.includes("reverted")) throw e;
    }
  }
  throw new Error("Transaction confirmation timed out");
}
// ────────────────────────────────────────────────────────────────

export function useCheckIn(address?: `0x${string}`) {
  const [isCheckingIn, setChecking]   = useState(false);
  const [txPending,    setTxPending]  = useState(false);
  const [txSuccess,    setTxSuccess]  = useState(false);
  const [pendingTx,    setPendingTx]  = useState<string | undefined>(undefined);

  // "done today" — starts as false, set by localStorage (instant) or Firebase (cross-browser)
  const [doneToday, setDoneToday] = useState(false);

  const addrRef = useRef(address);
  useEffect(() => { addrRef.current = address; }, [address]);

  // On wallet connect: check localStorage first (instant), then Firebase (cross-browser)
  useEffect(() => {
    if (!address) { setDoneToday(false); return; }

    // 1 — localStorage check: instant, no network
    if (lsIsDone(address)) {
      setDoneToday(true);
      return;
    }

    // 2 — Firebase check: works after cache clear or in a new browser
    let cancelled = false;
    getLastCheckinDate(address).then(date => {
      if (cancelled) return;
      if (date === todayStr()) {
        setDoneToday(true);
        lsMarkDone(address); // backfill localStorage so next load is instant
      }
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [address]);

  const contractEnabled =
    !!address && !!CHECKIN_CONTRACT &&
    CHECKIN_CONTRACT !== "0x0000000000000000000000000000000000000000";

  const {
    data:      checkInData,
    refetch,
    isLoading,
    isFetching,
  } = useReadContract({
    abi:          CHECKIN_ABI,
    address:      CHECKIN_CONTRACT,
    functionName: "getUserData",
    args:         address ? [address] : undefined,
    query: {
      enabled:              contractEnabled,
      staleTime:            0,
      refetchOnMount:       true,
      refetchOnWindowFocus: true,
    },
  });

  const { writeContractAsync } = useWriteContract();

  // Watch for pending tx confirmation
  useEffect(() => {
    if (!pendingTx) return;
    let cancelled = false;
    setTxPending(true);

    waitForReceipt(pendingTx)
      .then(async () => {
        if (cancelled) return;
        setTxPending(false);
        setChecking(false);
        setTxSuccess(true);
        setPendingTx(undefined);

        const addr = addrRef.current;
        if (addr) {
          // Mark done in both localStorage AND Firebase immediately
          lsMarkDone(addr);
          setDoneToday(true);

          try {
            await Promise.all([refetch(), syncStatsToFirebase(addr)]);
          } catch (err) {
            console.error("[useCheckIn] post-confirm sync failed:", err);
          }
        }

        setTimeout(() => { if (!cancelled) setTxSuccess(false); }, 5_000);
      })
      .catch(err => {
        if (!cancelled) {
          console.error("[useCheckIn] tx failed:", err);
          setTxPending(false);
          setChecking(false);
          setPendingTx(undefined);
        }
      });

    return () => { cancelled = true; };
  }, [pendingTx]); // eslint-disable-line react-hooks/exhaustive-deps

  const isContractLoading = contractEnabled && (isLoading || isFetching || checkInData === undefined);
  const streak = checkInData ? Number(checkInData[1]) : 0;

  // canCheckIn = contract says yes AND neither localStorage nor Firebase recorded today
  const contractSaysCanCheckIn = !isContractLoading && checkInData ? Boolean(checkInData[3]) : false;
  const canCheckIn = contractSaysCanCheckIn && !doneToday;

  const doCheckIn = useCallback(async () => {
    if (!address || !canCheckIn || isCheckingIn || txPending) return;
    setChecking(true);
    try {
      const hash = await writeContractAsync({
        abi:          CHECKIN_ABI,
        address:      CHECKIN_CONTRACT,
        functionName: "checkIn",
      });
      setPendingTx(hash);
    } catch (e) {
      console.error("[useCheckIn] write failed:", e);
      setChecking(false);
    }
  }, [address, canCheckIn, isCheckingIn, txPending, writeContractAsync]);

  return { streak, canCheckIn, doCheckIn, isCheckingIn, txPending, txSuccess, isContractLoading, refetch };
}
