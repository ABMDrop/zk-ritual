import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// ── Profile — only identity info lives in Firebase ────────────
export interface Profile {
  address:    string;
  username:   string | null;
  twitter:    string | null;
  discord:    string | null;
  created_at: string;
}

export interface LeaderboardRow {
  address:          string;
  total_points:     number;
  badges_earned:    number;
  username:         string | null;
}

export async function getProfile(address: string): Promise<Profile | null> {
  const ref  = doc(db, "profiles", address.toLowerCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Profile;
}

export async function upsertProfile(
  profile: Partial<Profile> & { address: string }
) {
  const addr = profile.address.toLowerCase();
  const ref  = doc(db, "profiles", addr);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...profile, address: addr });
  } else {
    await setDoc(ref, {
      username:   null,
      twitter:    null,
      discord:    null,
      created_at: new Date().toISOString(),
      ...profile,
      address: addr,
    });
  }
}

export async function isUsernameTaken(
  username: string,
  currentAddress?: string
): Promise<boolean> {
  const q    = query(collection(db, "profiles"), orderBy("username"), limit(500));
  const snap = await getDocs(q);
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as Profile;
    if (
      data.username?.toLowerCase() === username.toLowerCase() &&
      data.address !== currentAddress?.toLowerCase()
    ) {
      return true;
    }
  }
  return false;
}

// ── Leaderboard cache ─────────────────────────────────────────
// Stores total_points, badges_earned, and last_checkin_date.
// Source of truth for all numeric data is the blockchain.
// last_checkin_date (YYYY-MM-DD) is used only to prevent the UI
// from showing CHECK IN after a page refresh on the same day.
export async function updateLeaderboardEntry(
  address:          string,
  total_points:     number,
  badges_earned:    number,
  last_checkin_date?: string   // YYYY-MM-DD, optional
) {
  const addr = address.toLowerCase();
  const ref  = doc(db, "leaderboard", addr);
  const snap = await getDoc(ref);
  const payload: Record<string, unknown> = {
    address: addr,
    total_points,
    badges_earned,
    updated_at: new Date().toISOString(),
  };
  if (last_checkin_date) payload.last_checkin_date = last_checkin_date;

  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
}

// Returns "YYYY-MM-DD" of the last check-in stored for this address, or null
export async function getLastCheckinDate(address: string): Promise<string | null> {
  try {
    const ref  = doc(db, "leaderboard", address.toLowerCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as { last_checkin_date?: string };
    return data.last_checkin_date ?? null;
  } catch {
    return null;
  }
}

export async function getLeaderboard(limitCount = 20): Promise<LeaderboardRow[]> {
  const q    = query(
    collection(db, "leaderboard"),
    orderBy("total_points", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  if (snap.empty) return [];

  const rows: LeaderboardRow[] = await Promise.all(
    snap.docs.map(async (d) => {
      const data        = d.data() as { address: string; total_points: number; badges_earned?: number };
      const profileRef  = doc(db, "profiles", data.address);
      const profileSnap = await getDoc(profileRef);
      const username    = profileSnap.exists()
        ? (profileSnap.data() as Profile).username
        : null;
      return {
        address:       data.address,
        total_points:  data.total_points,
        badges_earned: data.badges_earned ?? 0,
        username,
      };
    })
  );
  return rows;
}
