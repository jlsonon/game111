"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Moon, ShieldAlert, Sun, UserX } from "lucide-react";
import { useState } from "react";

export function Mafia({ room, userId }: { room: RoomState; userId: string }) {
  const player = room.players[userId];
  const isAlive = player?.isAlive;
  const role = player?.role;
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleAction(targetId: string) {
    if (!isAlive || hasVoted) return;
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className={`p-8 text-center border-white/5 shadow-2xl transition-colors duration-1000 ${room.phase === "NIGHT" ? "bg-indigo-950/40" : "bg-orange-900/10"}`}>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center justify-center gap-2">
          {room.phase === "NIGHT" ? <Moon size={16} /> : <Sun size={16} />}
          Mafia Round {room.round} - {room.phase}
        </h2>
        <div className="max-w-3xl mx-auto">
           <h1 className="text-4xl md:text-5xl font-black leading-tight text-white italic uppercase tracking-tighter">
             {room.phase === "NIGHT" ? "Night Falls..." : "A New Day Dawns"}
           </h1>
           <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-400">
             Your Role: <span className="text-cyan-400">{role || "CITIZEN"}</span>
           </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
             {Object.values(room.players).map((p) => (
               <button
                 key={p.id}
                 onClick={() => handleAction(p.id)}
                 disabled={!isAlive || hasVoted || p.id === userId || !p.isAlive}
                 className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${!p.isAlive ? "opacity-30 grayscale cursor-not-allowed border-zinc-800" : hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-cyan-400/50 hover:bg-cyan-500/5 hover:scale-[1.02]"}`}
               >
                 <div className="size-16 rounded-full bg-zinc-800 grid place-items-center mb-4 transition-colors group-hover:bg-zinc-700">
                   {p.isAlive ? (
                      <span className="text-2xl font-black">{p.username[0].toUpperCase()}</span>
                   ) : (
                      <UserX size={24} className="text-rose-500" />
                   )}
                 </div>
                 <div className="text-lg font-black text-white">{p.username}</div>
                 {p.isAlive && !hasVoted && isAlive && p.id !== userId && (
                   <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                     {room.phase === "NIGHT" ? (role === "MAFIA" ? "Eliminate" : role === "DOCTOR" ? "Save" : "Investigate") : "Vote to Lynch"}
                   </div>
                 )}
                 {!p.isAlive && (
                   <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-rose-500">Eliminated</div>
                 )}
               </button>
             ))}
          </div>

          {!isAlive && (
            <Panel className="p-8 border-rose-500/20 bg-rose-500/5 text-center">
               <h3 className="text-2xl font-black text-rose-500 italic uppercase">You are dead</h3>
               <p className="mt-2 text-zinc-400 font-medium">You can no longer participate in actions, but you can still watch the drama unfold.</p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-5">
             <div className="space-y-6">
               <Metric label="Phase" value={room.phase} />
               <Metric label="Alive" value={`${Object.values(room.players).filter(p => p.isAlive).length}/${Object.values(room.players).length}`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <ShieldAlert size={12} className="text-amber-400" /> Recent Events
                 </p>
                 <div className="space-y-2">
                    {room.chat.filter(m => m.kind === "SYSTEM").slice(-3).map(m => (
                      <div key={m.id} className="text-[10px] font-bold text-zinc-400 italic">
                        • {m.message}
                      </div>
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
