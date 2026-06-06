import { Metric, Panel, SectionHeader } from "@/components/ui";
import { leaderboardEntries } from "@/lib/catalog";

export default function LeaderboardsPage() {
  const categories = ["XP", "Wins", "Coins", "Trivia", "Drawing", "Bluffing"];
  const periods = ["Weekly", "Monthly", "All-time"];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Competition" title="Leaderboards">
        Global and friend ladders for every major progression category, scoped weekly, monthly, and all-time.
      </SectionHeader>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {periods.map((period) => <Metric key={period} label={period} value="Live" detail="snapshot cached" />)}
      </div>
      <Panel className="mt-6 overflow-hidden">
        <div className="grid grid-cols-3 gap-2 border-b border-white/10 p-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 sm:grid-cols-6">
          {categories.map((category) => <span key={category}>{category}</span>)}
        </div>
        <div className="grid gap-2 p-4">
          {leaderboardEntries.map((entry, index) => (
            <div key={entry.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-white/8 p-3">
              <span className="grid size-10 place-items-center rounded-lg bg-white font-black text-zinc-950">{index + 1}</span>
              <div>
                <div className="font-bold">{entry.name}</div>
                <div className="text-sm text-zinc-400">{entry.title}</div>
              </div>
              <div className="text-right text-sm font-bold">{entry.wins} wins<br /><span className="text-cyan-300">{entry.coins.toLocaleString()} coins</span></div>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}
