"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Ghost, Moon, ShieldAlert, Sun, UserX } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sensory } from "@/lib/sensory";

export function Mafia({ room, userId }: { room: RoomState; userId: string }) {
  const player = room.players[userId];
  const isAlive = player?.isAlive;
  const role = player?.role;
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleAction(targetId: string) {
    if (!isAlive || hasVoted) return;
    sensory.playSfx("POP");
    sensory.vibrate(10);
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <Panel className={`p-8 text-center border-white/5 shadow-2xl transition-colors duration-1000 ${room.phase === "NIGHT" ? "bg-indigo-950/40" : "bg-orange-900/10"}`}>
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-4 flex items-center justify-center gap-2">
            {room.phase === "NIGHT" ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-400" />}
            Mafia Round {room.round} - {room.phase}
          </h2>
          <div className="max-w-3xl mx-auto">
             <h1 className="text-5xl md:text-6xl font-black leading-tight text-white italic uppercase tracking-tighter">
               {room.phase === "NIGHT" ? "Night Falls..." : "A New Day Dawns"}
             </h1>
             <motion.div 
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-400 shadow-xl"
             >
               Your Secret Identity: <span className="text-cyan-400 text-sm">{role || "CITIZEN"}</span>
             </motion.div>
          </div>
        </Panel>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
             <AnimatePresence mode="popLayout">
               {Object.values(room.players).map((p) => (
                 <motion.button
                   layout
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.5 }}
                   key={p.id}
                   onClick={() => handleAction(p.id)}
                   disabled={!isAlive || hasVoted || p.id === userId || !p.isAlive}
                   className={`group relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${!p.isAlive ? "opacity-30 grayscale cursor-not-allowed border-zinc-800" : hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-cyan-400/50 hover:bg-cyan-500/5 hover:scale-[1.02] shadow-lg"}`}
                 >
                   <div className={`size-16 rounded-2xl grid place-items-center mb-4 transition-all duration-500 ${p.isAlive ? "bg-zinc-800 group-hover:bg-zinc-700 shadow-xl" : "bg-rose-950/20"}`}>
                     {p.isAlive ? (
                        <span className="text-3xl font-black text-white">{p.username[0].toUpperCase()}</span>
                     ) : (
                        <UserX size={28} className="text-rose-500 animate-pulse" />
                     )}
                   </div>
                   <div className="text-lg font-black text-white italic uppercase">{p.username}</div>
                   {p.isAlive && !hasVoted && isAlive && p.id !== userId && (
                     <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                       {room.phase === "NIGHT" ? (role === "MAFIA" ? "Eliminate" : role === "DOCTOR" ? "Save" : "Investigate") : "Vote to Lynch"}
                     </div>
                   )}
                   {!p.isAlive && (
                     <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-rose-500">Eliminated</div>
                   )}
                 </motion.button>
               ))}
             </AnimatePresence>
          </div>

          <AnimatePresence>
            {!isAlive && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <Panel className="p-8 border-indigo-500/20 bg-indigo-500/5 text-center shadow-2xl overflow-hidden relative">
                   <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 blur-3xl size-32 bg-indigo-500/20 rounded-full" />
                   <h3 className="text-3xl font-black text-indigo-400 italic uppercase tracking-tighter flex items-center justify-center gap-3">
                     <Ghost size={32} className="animate-bounce" /> You are a Ghost
                   </h3>
                   <p className="mt-2 text-zinc-400 font-medium">You can no longer act, but you can see the truth. Watch the living struggle!</p>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
           <Panel className="p-5 border-t-4 border-amber-500/20">
             <div className="space-y-6">
               <Metric label="Current Phase" value={room.phase} />
               <Metric label="Survivors" value={`${Object.values(room.players).filter(p => p.isAlive).length}/${Object.values(room.players).length}`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                   <ShieldAlert size={14} className="text-amber-400" /> Intelligence
                 </p>
                 <div className="space-y-3">
                    {room.chat.filter(m => m.kind === "SYSTEM").slice(-3).map(m => (
                      <motion.div 
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={m.id} 
                        className="text-[10px] font-bold text-zinc-400 italic border-l-2 border-white/10 pl-3 leading-relaxed"
                      >
                        {m.message}
                      </motion.div>
                    ))}
                 </div>
               </div>
             </div>
           </Panel>
        </div>
      </div>
    </div>
  );
}
