import { GameGrid } from "@/components/game-grid";
import { SectionHeader } from "@/components/ui";

export default function GamesPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Catalog" title="All PARTYVERSE Games">
        Ten launch-ready game modes share the same room, player, scoring, replay, achievement, and reward systems.
      </SectionHeader>
      <div className="mt-8">
        <GameGrid />
      </div>
    </section>
  );
}
