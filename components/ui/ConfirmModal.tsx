"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message, confirmLabel = "CONFIRM", onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full rounded-2xl p-6 flex flex-col gap-4"
        style={{ maxWidth: 340, background: "#1a1917", border: "1px solid var(--bd3)" }}>
        <div className="text-[14px] font-bold text-acc tracking-wider"
          style={{ fontFamily: "'Rajdhani',sans-serif" }}>{title}</div>
        <div className="text-[11px] text-acc3 leading-relaxed">{message}</div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-acc3"
            style={{ background: "rgba(255,252,248,0.04)", border: "1px solid var(--bd)" }}>
            CANCEL
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
