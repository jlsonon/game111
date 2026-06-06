"use client";

import { useState } from "react";
import { Button, Panel } from "./ui";
import { usePartyverseStore } from "@/store/partyverse-store";
import { Loader2, Sparkles } from "lucide-react";

export function NicknameAuth() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProfile } = usePartyverseStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      setProfile(data);
      // Save to localStorage for persistence
      localStorage.setItem("partyverse-profile", JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
      <Panel className="w-full max-w-md p-8 shadow-2xl shadow-cyan-500/10">
        <div className="flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white">
            <Sparkles size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white">Welcome to Partyverse</h2>
          <p className="mt-2 text-zinc-400">Enter a nickname to join the party.</p>

          <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Nickname"
                required
                minLength={2}
                maxLength={20}
                className="h-14 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-lg font-bold text-white outline-none ring-cyan-500/50 transition-all focus:border-cyan-400 focus:ring-4"
                autoFocus
              />
              {error && <p className="mt-2 text-left text-sm font-medium text-rose-400">{error}</p>}
            </div>

            <Button type="submit" className="h-14 w-full text-lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Start Playing"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-zinc-500">
            No password required. Your progress will be saved to this nickname.
          </p>
        </div>
      </Panel>
    </div>
  );
}
