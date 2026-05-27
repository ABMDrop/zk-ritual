/**
 * syncStats
 * Reads totalPoints + streak FRESH from both contracts,
 * then updates the leaderboard cache in Firebase.
 * Also saves last_checkin_date (YYYY-MM-DD) so the UI can
 * show "DONE TODAY" immediately on page refresh — even in a
 * different browser or after cache clear.
 */
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmi";
import { BADGE_ABI, BADGE_CONTRACT, CHECKIN_ABI, CHECKIN_CONTRACT } from "@/lib/contracts";
import { updateLeaderboardEntry } from "@/lib/firebase";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function contractsReady(): boolean {
  return (
    !!BADGE_CONTRACT   && BADGE_CONTRACT   !== ZERO_ADDR &&
    !!CHECKIN_CONTRACT && CHECKIN_CONTRACT !== ZERO_ADDR
  );
}

function todayDateString(): string {
  // Returns "YYYY-MM-DD" in local time
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface SyncResult {
  streak:           number;
  totalPoints:      number;
  badgesEarned:     number;
  lastCheckinDate:  string;   // YYYY-MM-DD
}

export async function syncStatsToFirebase(
  address: `0x${string}`
): Promise<SyncResult> {
  if (!contractsReady()) {
    return { streak: 0, totalPoints: 0, badgesEarned: 0, lastCheckinDate: "" };
  }

  const [onChainPoints, earnedBadges, checkInData] = await Promise.all([
    readContract(wagmiConfig, {
      abi: BADGE_ABI, address: BADGE_CONTRACT,
      functionName: "totalPoints",
      args: [address],
    }),
    readContract(wagmiConfig, {
      abi: BADGE_ABI, address: BADGE_CONTRACT,
      functionName: "getUserBadges",
      args: [address],
    }),
    readContract(wagmiConfig, {
      abi: CHECKIN_ABI, address: CHECKIN_CONTRACT,
      functionName: "getUserData",
      args: [address],
    }),
  ]);

  const badgePts        = Number(onChainPoints);
  const streak          = Number((checkInData as readonly [bigint, bigint, bigint, boolean])[1]);
  const badgesEarned    = Array.from(earnedBadges as readonly boolean[]).filter(Boolean).length;
  const totalPoints     = badgePts + streak * 5;
  const lastCheckinDate = todayDateString();   // we only call this fn after a check-in

  // Save to Firebase leaderboard cache — including today's date
  await updateLeaderboardEntry(address, totalPoints, badgesEarned, lastCheckinDate);

  return { streak, totalPoints, badgesEarned, lastCheckinDate };
}
