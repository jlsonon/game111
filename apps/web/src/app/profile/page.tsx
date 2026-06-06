import { Metric, Panel, SectionHeader } from "@/components/ui";
import { achievements, calculateProgression, titles } from "@/lib/catalog";

export default function ProfilePage() {
  const progress = calculateProgression(18420);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Player Profile" title="Guest Player">
        Unique profile with XP, coins, rank, titles, wins, losses, accuracy, streaks, achievements, and match history.
      </SectionHeader>
      <div className="mt-8 grid gap-4 lg:grid-cols-[360px_1fr]">
        <Panel className="p-5">
          <div className="grid size-28 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-4xl font-black text-zinc-950">GP</div>
          <h2 className="mt-5 text-2xl font-black">Guest Player</h2>
          <p className="text-zinc-400">Equipped title: Quick Thinker</p>
          <div className="mt-5 h-3 rounded-full bg-white/10">
            <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${progress.progress}%` }} />
          </div>
          <div className="mt-2 text-sm text-zinc-400">Level {progress.level} - {progress.xpForCurrentLevel}/{progress.xpForNextLevel} XP</div>
        </Panel>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label="XP" value="18,420" />
            <Metric label="Coins" value="4,850" />
            <Metric label="Wins" value="126" />
            <Metric label="Accuracy" value="78%" />
          </div>
          <Panel className="p-5">
            <h3 className="text-xl font-black">Equipable Titles</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {titles.map((title) => (
                <span key={title.id} className="rounded-lg border border-white/10 bg-white/8 px-3 py-2 text-sm">{title.name}</span>
              ))}
            </div>
          </Panel>
          <Panel className="p-5">
            <h3 className="text-xl font-black">Achievement Engine</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.slice(0, 9).map((achievement) => (
                <div key={achievement.id} className="rounded-lg bg-black/20 p-3">
                  <div className="text-sm font-bold">{achievement.name}</div>
                  <div className="mt-1 text-xs text-zinc-400">{achievement.xpReward} XP - {achievement.coinReward} coins</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
