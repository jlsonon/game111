import { GameGrid } from "@/components/game-grid";
import { InstallPrompt } from "@/components/install-prompt";
import { RoomLauncher } from "@/components/room-launcher";
import { Metric, Panel, SectionHeader } from "@/components/ui";
import { achievements, galleryMoments, leaderboardEntries } from "@/lib/catalog";
import { Activity, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:items-center lg:py-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
            <Sparkles size={16} /> Realtime rooms, ten party games, one code
          </div>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">PARTYVERSE</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            A mobile-first PWA for instant multiplayer party games: drawing, bluffing, trivia, social deduction, memes, voting, rewards, seasons, and shareable moments.
          </p>
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Games" value="10" detail="connected catalog" />
            <Metric label="Achievements" value={`${achievements.length}+`} detail="reward engine" />
            <Metric label="Rooms" value="Realtime" detail="Socket.io" />
            <Metric label="PWA" value="Install" detail="offline shell" />
          </div>
        </div>
        <RoomLauncher />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <InstallPrompt />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeader eyebrow="Game System" title="Choose the room experience">
          Host controls can switch games, tune rounds and timers, lock rooms, mute players, and keep everyone in one shared party lobby.
        </SectionHeader>
        <div className="mt-6">
          <GameGrid />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <Panel className="p-5">
          <Crown className="text-amber-300" />
          <h3 className="mt-4 text-xl font-black">Progression Economy</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">XP, coins, ranks, titles, inventory cosmetics, daily streaks, weekly rewards, and seasonal ladders.</p>
        </Panel>
        <Panel className="p-5">
          <Users className="text-cyan-300" />
          <h3 className="mt-4 text-xl font-black">Social Platform</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Friend requests, invitations, match history, hall of fame, saved moments, and one-click sharing cards.</p>
        </Panel>
        <Panel className="p-5">
          <ShieldCheck className="text-emerald-300" />
          <h3 className="mt-4 text-xl font-black">Admin Ready</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">Manage users, rooms, achievements, questions, trivia, reports, analytics, and platform operations.</p>
        </Panel>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <Panel className="p-5">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">
            <Activity size={16} /> Global leaderboard
          </div>
          <div className="mt-5 grid gap-3">
            {leaderboardEntries.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-white/8 p-3">
                <div className="grid size-9 place-items-center rounded-lg bg-white text-sm font-black text-zinc-950">{index + 1}</div>
                <div>
                  <div className="font-bold">{entry.name}</div>
                  <div className="text-xs text-zinc-400">{entry.title}</div>
                </div>
                <div className="text-right text-sm font-bold">{entry.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-bold uppercase tracking-[0.22em] text-fuchsia-300">Funny moments</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {galleryMoments.map((moment) => (
              <div key={moment.title} className={`min-h-36 rounded-lg bg-gradient-to-br ${moment.color} p-4 text-zinc-950`}>
                <div className="text-xs font-black uppercase tracking-[0.2em]">{moment.game}</div>
                <div className="mt-8 text-xl font-black">{moment.title}</div>
                <div className="mt-1 text-sm font-bold opacity-80">{moment.stat}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
