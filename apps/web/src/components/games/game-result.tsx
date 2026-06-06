"use client";

import { Button, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Award, ChevronRight, Home, Share2, Trophy } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { sensory } from "@/lib/sensory";

export function GameResult({ room, userId }: { room: RoomState; userId: string }) {
  const players = Object.values(room.players).sort((a, b) => b.score - a.score);
  const winners = players.slice(0, 3);
  const isHost = room.hostId === userId;

  function shareVictory() {
    sensory.playSfx("NOTIFICATION");
    const text = `I just won a game of ${room.gameType} on Partyverse! Join the next party with code: ${room.code}`;
    if (navigator.share) {
      navigator.share({ title: "Partyverse Victory!", text, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(text);
      alert("Victory link copied to clipboard!");
    }
  }

  return (
    <div className="grid gap-8 h-full content-start py-8">
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="text-center"
      >
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-white mb-2 drop-shadow-2xl">
          Game Over
        </h1>
        <p className="text-cyan-400 font-black uppercase tracking-[0.4em] text-sm animate-pulse">Match Analysis Complete</p>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-0 mt-12 mb-16 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Second Place */}
        {winners[1] && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center group w-full md:w-48 order-2 md:order-1"
          >
             <div className="text-zinc-500 font-black mb-3 uppercase tracking-widest text-xs italic">Runner Up</div>
             <div className="size-24 rounded-[1.5rem] bg-zinc-800 border-2 border-zinc-700 grid place-items-center mb-4 transition-all group-hover:scale-110 group-hover:border-zinc-500 shadow-2xl">
                <span className="text-4xl font-black text-white">{winners[1].username[0].toUpperCase()}</span>
             </div>
             <div className="text-xl font-black text-white uppercase italic">{winners[1].username}</div>
             <div className="text-sm font-bold text-zinc-500 tracking-tighter">{winners[1].score.toLocaleString()} PTS</div>
             <div className="w-full h-24 bg-zinc-800/20 rounded-t-3xl mt-8 border-x border-t border-white/5 hidden md:block" />
          </motion.div>
        )}

        {/* First Place */}
        {winners[0] && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="flex flex-col items-center group w-full md:w-64 order-1 md:order-2 z-10"
          >
             <div className="text-amber-400 font-black mb-3 uppercase tracking-widest text-lg italic flex items-center gap-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
               <Trophy size={24} className="fill-amber-400" /> Grand Winner
             </div>
             <div className="size-36 md:size-44 rounded-[2.5rem] bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 p-1.5 mb-5 transition-transform group-hover:scale-105 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
                <div className="w-full h-full rounded-[2.2rem] bg-zinc-950 grid place-items-center border-2 border-white/10">
                  <span className="text-6xl font-black text-white drop-shadow-lg">{winners[0].username[0].toUpperCase()}</span>
                </div>
             </div>
             <div className="text-3xl font-black text-white uppercase italic tracking-tight">{winners[0].username}</div>
             <div className="text-xl font-black text-amber-400 mt-1 tracking-tighter">{winners[0].score.toLocaleString()} PTS</div>
             <div className="w-full h-44 bg-zinc-800/40 rounded-t-[3rem] mt-8 border-x border-t border-white/10 hidden md:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent" />
                <motion.div 
                  animate={{ y: [-10, 10, -10] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-x-0 top-10 flex justify-center opacity-20"
                >
                  <Trophy size={80} className="text-amber-500" />
                </motion.div>
             </div>
          </motion.div>
        )}

        {/* Third Place */}
        {winners[2] && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center group w-full md:w-48 order-3"
          >
             <div className="text-orange-600 font-black mb-3 uppercase tracking-widest text-xs italic">3rd Place</div>
             <div className="size-20 rounded-[1.2rem] bg-zinc-900 border-2 border-orange-900/40 grid place-items-center mb-4 transition-all group-hover:scale-110 shadow-xl">
                <span className="text-3xl font-black text-zinc-300">{winners[2].username[0].toUpperCase()}</span>
             </div>
             <div className="text-lg font-black text-zinc-100 uppercase italic">{winners[2].username}</div>
             <div className="text-sm font-bold text-zinc-500 tracking-tighter">{winners[2].score.toLocaleString()} PTS</div>
             <div className="w-full h-16 bg-zinc-900/30 rounded-t-3xl mt-8 border-x border-t border-white/5 hidden md:block" />
          </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto w-full"
      >
         <Panel className="p-6 border-b-4 border-cyan-500/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5 flex items-center gap-2">
              <Award size={14} className="text-cyan-400" /> Match Metrics
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Total Rounds</span>
                 <span className="text-white font-black font-mono">{room.round}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Active Players</span>
                 <span className="text-white font-black font-mono">{Object.keys(room.players).length}</span>
               </div>
               <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                 <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Game Engine</span>
                 <span className="text-cyan-400 font-black italic uppercase text-[10px] tracking-tighter">{room.gameType}</span>
               </div>
            </div>
         </Panel>

         <Panel className="p-6 col-span-1 lg:col-span-2 border-b-4 border-fuchsia-500/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5 flex items-center gap-2">
              <Share2 size={14} className="text-fuchsia-400" /> Viral Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-center">
               <Button onClick={shareVictory} className="bg-white/5 border-white/10 hover:bg-fuchsia-500 hover:text-zinc-950 hover:scale-105 h-14 font-black uppercase italic tracking-tight shadow-xl shadow-fuchsia-500/5">
                 <Share2 size={18} /> Share Victory Card
               </Button>
               <Button className="bg-white/5 border-white/10 hover:bg-white/10 h-14 font-black uppercase italic tracking-tight">
                 Download Match Replay
               </Button>
            </div>
         </Panel>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
      >
        <Link href="/">
          <Button className="bg-zinc-800 hover:bg-zinc-700 border-white/5 h-16 px-10 font-black uppercase italic tracking-widest text-sm w-full sm:w-auto">
            <Home size={20} /> Exit Arena
          </Button>
        </Link>
        {isHost && (
          <Button 
            onClick={() => {
              sensory.playSfx("SUCCESS");
              getSocket().emit("set_game", { code: room.code, userId, gameType: room.gameType! });
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-zinc-950 h-16 px-12 font-black uppercase italic tracking-widest text-sm shadow-2xl shadow-cyan-500/30 w-full sm:w-auto"
          >
            Play Again <ChevronRight size={22} />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
