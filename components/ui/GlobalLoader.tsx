"use client";

interface GlobalLoaderProps {
  loading: boolean;
  label?: string;
}

export default function GlobalLoader({ loading, label = "LOADING..." }: GlobalLoaderProps) {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: "rgba(13,12,11,0.88)", backdropFilter: "blur(6px)" }}>
      {/* Spinner */}
      <div style={{
        width: 52, height: 52,
        borderRadius: "50%",
        border: "3px solid rgba(255,252,248,0.08)",
        borderTop: "3px solid rgba(139,92,246,0.85)",
        animation: "zkred-spin 0.9s linear infinite",
        marginBottom: 20,
      }} />
      <div className="text-[11px] font-bold tracking-[3px]"
        style={{ color: "rgba(255,252,248,0.5)", fontFamily: "'Space Mono',monospace" }}>
        {label}
      </div>
      <style>{`
        @keyframes zkred-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
