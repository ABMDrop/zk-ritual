"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href:"/",        label:"HOME",    icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>
    </svg>)},
  { href:"/badge",   label:"BADGE",   icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>)},
  { href:"/profile", label:"PROFILE", icon:(a:boolean)=>(
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>)},
];

export default function BottomNav() {
  const path = usePathname();
  const activeIdx = NAV.findIndex(n => n.href === path);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 flex"
      style={{ maxWidth:560, height:70, background:"rgba(13,12,11,0.98)", borderTop:"1px solid var(--bd2)" }}>

      {/* Active indicator */}
      <div className="absolute bottom-0 h-0.5 bg-acc rounded-t transition-all duration-300"
        style={{ width:`${100/3}%`, left:`${(activeIdx >= 0 ? activeIdx : 0) * 100/3}%` }} />

      {NAV.map(({ href, label, icon }) => {
        const active = path === href;
        return (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ color: active ? "#f2ede6" : "rgba(242,237,230,0.35)", textDecoration:"none" }}>
            {icon(active)}
            <span style={{ fontSize:9, letterSpacing:"1.5px" }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
