"use client";

import { Panel } from "@/components/ui";
import { games } from "@/lib/catalog";
import { usePartyverseStore } from "@/store/partyverse-store";
import { motion } from "framer-motion";
import { Brush, Drama, Eye, Fingerprint, MessageCircleQuestion, Mic2, PencilLine, Swords, Trophy, Vote } from "lucide-react";

const icons = [Brush, Drama, Mic2, Trophy, Eye, Swords, PencilLine, Vote, MessageCircleQuestion, Fingerprint];

export function GameGrid() {
  const { selectedGame, setSelectedGame } = usePartyverseStore();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {games.map((game, index) => {
        const Icon = icons[index] ?? Trophy;
        const active = game.type === selectedGame;

        return (
          <motion.button
            key={game.type}
            type="button"
            onClick={() => setSelectedGame(game.type)}
            whileHover={{ y: -4 }}
            className="text-left"
          >
            <Panel className={`h-full p-4 transition ${active ? "border-cyan-300/70 bg-cyan-300/12" : "hover:bg-white/10"}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-white text-zinc-950">
                  <Icon size={20} />
                </span>
                <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300">{game.minPlayers}-{game.maxPlayers}</span>
              </div>
              <h3 className="mt-4 text-lg font-black text-white">{game.name}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-400">{game.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">{game.primarySkill}</span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">{game.averageMinutes} min</span>
              </div>
            </Panel>
          </motion.button>
        );
      })}
    </div>
  );
}
