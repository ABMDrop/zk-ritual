import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import WalletGate from "@/components/layout/WalletGate";

export const metadata: Metadata = {
  title: "ZK Ritual — Ritual Proof Network",
  description: "On-chain reputation badges powered by Ritual ZK proofs",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-g0 text-acc font-mono" style={{ maxWidth: 560, margin: "0 auto", minHeight: "100svh" }}>
        <Providers>
          <WalletGate>{children}</WalletGate>
        </Providers>
      </body>
    </html>
  );
}
