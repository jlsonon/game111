"use client";

import { GhostButton } from "@/components/ui";
import { NicknameAuth } from "@/components/nickname-auth";
import { AchievementToast } from "@/components/achievement-toast";
import { usePartyverseStore } from "@/store/partyverse-store";
import { Bell, Gamepad2, Menu, Moon, Share2, Sun, User as UserIcon, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  ["Games", "/games"],
  ["Leaderboards", "/leaderboards"],
  ["Shop", "/shop"],
  ["Gallery", "/gallery"],
  ["Social", "/social"],
  ["Profile", "/profile"],
  ["Admin", "/admin"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, profile, setProfile } = usePartyverseStore();
  const [open, setOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("partyverse-profile");
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored profile", e);
      }
    }
    setIsHydrated(true);
  }, [setProfile]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const needsAuth = isHydrated && (!profile.id || profile.username === "Guest Player");

  return (
    <div className="min-h-screen bg-[#090a12] text-white selection:bg-cyan-300 selection:text-zinc-950">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090a12]/84 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-500/20">
              <Gamepad2 size={22} />
            </span>
            <span className="text-lg font-black tracking-[0.18em]">PARTYVERSE</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/8 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/shop" className="mr-2">
              <div className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-2 pr-4 text-xs font-bold text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                <div className="grid size-7 place-items-center rounded-full bg-amber-400 text-zinc-950">
                  <ShoppingBag size={14} />
                </div>
                {profile.coins.toLocaleString()}
              </div>
            </Link>
            
            <div className="mr-2 hidden items-center gap-2 rounded-full bg-white/5 py-1.5 pl-2 pr-4 text-xs font-bold text-zinc-400 sm:flex">
              <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
                <UserIcon size={14} />
              </div>
              {profile.username}
            </div>
            
            <GhostButton className="hidden px-3 sm:inline-flex" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </GhostButton>
            <GhostButton className="hidden px-3 sm:inline-flex" aria-label="Notifications">
              <Bell size={18} />
            </GhostButton>
            <GhostButton
              className="hidden px-3 sm:inline-flex"
              onClick={() => navigator.share?.({ title: "PARTYVERSE", text: "Join my PARTYVERSE room.", url: location.href })}
              aria-label="Share"
            >
              <Share2 size={18} />
            </GhostButton>
            <GhostButton className="px-3 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
              <Menu size={18} />
            </GhostButton>
          </div>
        </div>
        {open ? (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="grid gap-2">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg bg-white/8 px-3 py-3 text-sm font-semibold text-zinc-100">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <main>
        {children}
      </main>
      <AchievementToast />
      {needsAuth && <NicknameAuth />}
    </div>
  );
}
