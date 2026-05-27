"use client";
import { useEffect, useState, useCallback } from "react";
import { getProfile, upsertProfile, isUsernameTaken, Profile } from "@/lib/firebase";

export function useProfile(address?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) { setProfile(null); return; }
    setLoading(true);
    getProfile(address)
      .then(p => setProfile(p))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [address]);

  const saveUsername = useCallback(async (username: string): Promise<string | null> => {
    if (!address) return "Not connected";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return "3-20 chars, letters/numbers/_ only";
    const taken = await isUsernameTaken(username, address);
    if (taken) return "Username already taken";
    // Create profile row first if it doesn't exist
    await upsertProfile({ address, username });
    setProfile(p => p ? { ...p, username } : { address, username, twitter: null, discord: null, created_at: new Date().toISOString() });
    return null;
  }, [address]);

  const saveSocial = useCallback(async (platform: "twitter" | "discord", value: string): Promise<void> => {
    if (!address) return;
    await upsertProfile({ address, [platform]: value });
    setProfile(p => p
      ? { ...p, [platform]: value }
      : { address, username: null, twitter: null, discord: null, created_at: new Date().toISOString(), [platform]: value }
    );
  }, [address]);

  return { profile, loading, saveUsername, saveSocial };
}
