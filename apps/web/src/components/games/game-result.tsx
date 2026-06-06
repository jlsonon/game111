"use client";

import { Button, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Award, ChevronRight, Home, Share2, Trophy } from "lucide-react";
import Link from "next/link";

export function GameResult({ room, userId }: { room: RoomState; userId: string }) {
  const players = Object.values(room.players).sort((a, b) => b.score - a.score);
  const winners = players.slice(0, 3);
  const isHost = room.hostId === userId;

  return (
    <div className="grid gap-8 h-full content-start py-8">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white mb-2">Game Over!</h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em]">Thank you for playing {room.gameType?.replace("_", " ")}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-0 mt-12 mb-16">
        {/* Second Place */}
        {winners[1] && (
          <div className="flex flex-col items-center group w-full md:w-48 order-2 md:order-1">
             <div className="text-zinc-500 font-black mb-2 uppercase tracking-widest text-sm italic">2nd Place</div>
             <div className="size-20 md:size-24 rounded-2xl bg-zinc-800 border-2 border-zinc-700 grid place-items-center mb-4 transition-transform group-hover:scale-105 shadow-xl">
                <span className="text-3xl font-black text-white">{winners[1].username[0].toUpperCase()}</span>
             </div>
             <div className="text-lg font-black text-white">{winners[1].username}</div>
             <div className="text-sm font-bold text-zinc-500">{winners[1].score.toLocaleString()} PTS</div>
             <div className="w-full h-24 bg-zinc-800/40 rounded-t-3xl mt-6 border-x border-t border-white/5 hidden md:block"></div>
          </div>
        )}

        {/* First Place */}
        {winners[0] && (
          <div className="flex flex-col items-center group w-full md:w-64 order-1 md:order-2 z-10">
             <div className="text-amber-400 font-black mb-2 uppercase tracking-widest text-lg italic flex items-center gap-2">
               <Trophy size={20} className="fill-amber-400" /> Winner
             </div>
             <div className="size-28 md:size-36 rounded-[2rem] bg-gradient-to-br from-amber-300 to-amber-500 p-1 mb-4 transition-transform group-hover:scale-105 shadow-2xl shadow-amber-500/20">
                <div className="w-full h-full rounded-[1.8rem] bg-zinc-950 grid place-items-center">
                  <span className="text-5xl font-black text-white">{winners[0].username[0].toUpperCase()}</span>
                </div>
             </div>
             <div className="text-2xl font-black text-white">{winners[0].username}</div>
             <div className="text-lg font-black text-amber-400">{winners[0].score.toLocaleString()} PTS</div>
             <div className="w-full h-40 bg-zinc-800/60 rounded-t-[2.5rem] mt-6 border-x border-t border-white/10 hidden md:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent"></div>
             </div>
          </div>
        )}

        {/* Third Place */}
        {winners[2] && (
          <div className="flex flex-col items-center group w-full md:w-48 order-3">
             <div className="text-orange-600 font-black mb-2 uppercase tracking-widest text-sm italic">3rd Place</div>
             <div className="size-20 md:size-24 rounded-2xl bg-zinc-900 border-2 border-orange-900/30 grid place-items-center mb-4 transition-transform group-hover:scale-105 shadow-xl">
                <span className="text-3xl font-black text-white">{winners[2].username[0].toUpperCase()}</span>
             </div>
             <div className="text-lg font-black text-white">{winners[2].username}</div>
             <div className="text-sm font-bold text-zinc-500">{winners[2].score.toLocaleString()} PTS</div>
             <div className="w-full h-16 bg-zinc-900/40 rounded-t-3xl mt-6 border-x border-t border-white/5 hidden md:block"></div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto w-full">
         <Panel className="p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Award size={14} className="text-cyan-400" /> Match Stats
            </h3>
            <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-zinc-400 font-bold">Total Rounds</span>
                 <span className="text-white font-black">{room.round}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-zinc-400 font-bold">Players</span>
                 <span className="text-white font-black">{Object.keys(room.players).length}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-zinc-400 font-bold">Game Type</span>
                 <span className="text-white font-black italic uppercase text-xs">{room.gameType}</span>
               </div>
            </div>
         </Panel>

         <Panel className="p-6 col-span-1 lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Share2 size={14} className="text-fuchsia-400" /> Share this victory
            </h3>
            <div className="grid grid-cols-2 gap-4 h-full content-center">
               <Button className="bg-white/5 border-white/10 hover:bg-white/10 h-12">Copy Result Link</Button>
               <Button className="bg-white/5 border-white/10 hover:bg-white/10 h-12">Save to Gallery</Button>
            </div>
         </Panel>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <Link href="/">
          <Button className="bg-zinc-800 hover:bg-zinc-700 border-white/5 h-14 px-8 font-black uppercase italic">
            <Home size={18} /> Exit to Lobby
          </Button>
        </Link>
        {isHost && (
          <Button 
            onClick={() => getSocket().emit("set_game", { code: room.code, userId, gameType: room.gameType! })}
            className="bg-cyan-500 hover:bg-cyan-600 text-zinc-950 h-14 px-8 font-black uppercase italic shadow-xl shadow-cyan-500/20"
          >
            Play Again <ChevronRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
