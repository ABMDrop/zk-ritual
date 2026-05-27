"use client";
import { BadgeState } from "@/hooks/useBadges";

const LOGOS: Record<string, string> = {
  beginner: "/badges/Profiel.png",
  tx10:     "/badges/10 Transaction Badge.png",
  tx50:     "/badges/50 Tranasaction Badge.png",
  balance:  "/badges/Balance Badge.png",
  streak:   "/badges/30 Days Check Badge.png",
  x:        "/badges/Twitter Badge.png",
  discord:  "/badges/Discord Badge.png",
};

type Tier = { border: string; glow: string; text: string; bg: string; label: string };

export const TIERS: Record<string, Tier> = {
  beginner: { border:"rgba(34,197,94,0.65)",  glow:"rgba(34,197,94,0.15)",  text:"#4ade80", bg:"rgba(5,46,22,0.85)",   label:"COMMON"    },
  tx10:     { border:"rgba(59,130,246,0.65)",  glow:"rgba(59,130,246,0.15)", text:"#60a5fa", bg:"rgba(13,30,70,0.85)",  label:"UNCOMMON"  },
  tx50:     { border:"rgba(168,85,247,0.65)",  glow:"rgba(168,85,247,0.15)", text:"#c084fc", bg:"rgba(47,20,80,0.85)",  label:"RARE"      },
  balance:  { border:"rgba(249,115,22,0.65)",  glow:"rgba(249,115,22,0.15)", text:"#fb923c", bg:"rgba(60,25,10,0.85)",  label:"EPIC"      },
  streak:   { border:"rgba(234,179,8,0.65)",   glow:"rgba(234,179,8,0.15)",  text:"#fbbf24", bg:"rgba(60,45,0,0.85)",   label:"LEGENDARY" },
  x:        { border:"rgba(6,182,212,0.65)",   glow:"rgba(6,182,212,0.15)",  text:"#22d3ee", bg:"rgba(5,35,45,0.85)",   label:"SOCIAL"    },
  discord:  { border:"rgba(99,102,241,0.65)",  glow:"rgba(99,102,241,0.15)", text:"#818cf8", bg:"rgba(20,18,60,0.85)",  label:"SOCIAL"    },
};
export const DEFAULT_TIER: Tier = TIERS.beginner;

interface Props {
  badge: BadgeState;
  onClaim: (id: number) => void | Promise<void>;
  claimingId: number | null;
  claimSuccess: number | null;
  isConnected: boolean;
}

export default function BadgeCard({ badge, onClaim, claimingId, claimSuccess, isConnected }: Props) {
  const tier       = TIERS[badge.key] ?? DEFAULT_TIER;
  const isClaiming = claimingId === badge.id;
  const isSuccess  = claimSuccess === badge.id;
  const canClaim   = isConnected && badge.eligible && !badge.earned;
  const logoSrc    = LOGOS[badge.key];

  return (
    <div style={{
      borderRadius: 18,
      border: `1.5px solid ${tier.border}`,
      boxShadow: `0 0 20px 4px ${tier.glow}`,
      background: "#0d1117",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      /* Fixed height so ALL cards are identical size */
      height: 290,
      padding: "20px 14px 14px",
      overflow: "hidden",
    }}>

      {/* ── Round badge logo (same size as profile avatar: 72px) ── */}
      <div style={{
        width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
        border: `2.5px solid ${tier.border}`,
        boxShadow: `0 0 18px 6px ${tier.glow}, inset 0 0 10px rgba(0,0,0,0.5)`,
        overflow: "hidden",
        background: "#0a0e14",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {logoSrc
          ? <img src={logoSrc} alt={badge.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 26, opacity: 0.5 }}>?</span>}
      </div>

      {/* ── Badge name ── */}
      <div style={{
        marginTop: 12, flexShrink: 0,
        textAlign: "center",
        fontSize: 13,
        fontFamily: "'Rajdhani',sans-serif",
        fontWeight: 700,
        color: tier.text,
        letterSpacing: "0.5px",
        lineHeight: 1.25,
        height: 32,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {badge.name}
      </div>

      {/* ── Criteria ── */}
      <div style={{
        marginTop: 5, flexShrink: 0,
        fontSize: 10,
        color: "rgba(255,255,255,0.42)",
        textAlign: "center",
        lineHeight: 1.4,
        height: 28,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      } as React.CSSProperties}>
        {badge.criteria}
      </div>

      {/* ── Rarity pill ── */}
      <div style={{
        marginTop: 9, flexShrink: 0,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        padding: "3px 14px",
        borderRadius: 20,
        background: tier.glow,
        border: `1px solid ${tier.border}`,
        color: tier.text,
      }}>
        {tier.label}
      </div>

      {/* ── Action ── */}
      <div style={{ marginTop: "auto", width: "100%", paddingTop: 10 }}>
        {isSuccess ? (
          <div style={{
            textAlign: "center", borderRadius: 8, padding: "8px 4px",
            background: tier.bg, border: `1px solid ${tier.border}`,
            fontSize: 11, fontWeight: 700, color: tier.text, letterSpacing: "0.5px",
          }}>🎉 CLAIMED ON-CHAIN!</div>
        ) : badge.earned ? (
          <div style={{
            textAlign: "center", borderRadius: 8, padding: "8px 4px",
            background: tier.bg, border: `1px solid ${tier.border}`,
            fontSize: 11, fontWeight: 700, color: tier.text, letterSpacing: "0.5px",
          }}>✓ EARNED</div>
        ) : canClaim ? (
          <button onClick={() => onClaim(badge.id)} disabled={!!claimingId} style={{
            width: "100%", padding: "8px 4px", borderRadius: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
            background: isClaiming ? tier.glow : tier.bg,
            border: `1px solid ${tier.border}`, color: tier.text,
            cursor: claimingId ? "not-allowed" : "pointer",
            opacity: claimingId && !isClaiming ? 0.4 : 1, transition: "opacity 0.2s",
          }}>
            {isClaiming ? "⏳ CONFIRMING..." : "⚡ CLAIM BADGE"}
          </button>
        ) : (
          <div style={{
            textAlign: "center", borderRadius: 8, padding: "8px 4px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.10)",
            fontSize: 10, fontWeight: 700,
            color: "rgba(255,255,255,0.30)", letterSpacing: "0.3px",
          }}>
            {isConnected ? "🔒 NOT ELIGIBLE YET" : "CONNECT WALLET"}
          </div>
        )}
      </div>
    </div>
  );
}
