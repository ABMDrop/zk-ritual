interface Props { badgeKey: string; earned: boolean; eligible: boolean; size?: number; }

const IMG_BADGES: Record<string, string> = {
  beginner: "/badges/Profiel.png",
  tx10:     "/badges/10 Transaction Badge.png",
  tx50:     "/badges/50 Tranasaction Badge.png",
  x:        "/badges/Twitter Badge.png",
  discord:  "/badges/Discord Badge.png",
  balance:  "/badges/Balance Badge.png",
  streak:   "/badges/30 Days Check Badge.png",
};

const DOTS = [
  { cx: 14, cy: 18 }, { cx: 125, cy: 14 }, { cx: 11, cy: 72 },
  { cx: 128, cy: 112 }, { cx: 18, cy: 118 }, { cx: 120, cy: 60 },
];

export default function HexSVG({ badgeKey, size = 130 }: Props) {
  const imgSrc = IMG_BADGES[badgeKey];
  const imgSize = 96;
  const half = imgSize / 2;
  const cx = 70, cy = 70;

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`round-${badgeKey}`}>
          <circle cx={cx} cy={cy} r={half} />
        </clipPath>
      </defs>

      {/* Ambient dots */}
      {DOTS.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="2" fill="rgba(34,197,94,0.35)" />
      ))}

      {/* Big rounded badge logo — no inner frame */}
      {imgSrc ? (
        <image
          href={imgSrc}
          x={cx - half} y={cy - half}
          width={imgSize} height={imgSize}
          clipPath={`url(#round-${badgeKey})`}
          style={{ imageRendering: "crisp-edges" }}
        />
      ) : (
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="28" fill="#4ade80">?</text>
      )}
    </svg>
  );
}
