"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Search, ShieldAlert, Sparkles, UserCheck, UserX } from "lucide-react";
import { useState } from "react";

export function Impostor({ room, userId }: { room: RoomState; userId: string }) {
  const isImpostor = room.players[userId]?.role === "IMPOSTOR";
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleVote(targetId: string) {
    if (hasVoted) return;
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className={`p-8 text-center border-white/5 shadow-2xl transition-colors duration-1000 ${isImpostor ? "bg-rose-950/20" : "bg-cyan-950/20"}`}>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50 mb-4 flex items-center justify-center gap-2">
          <Sparkles size={16} /> Impostor Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          {isImpostor ? (
            <div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight text-rose-500 italic uppercase tracking-tighter">
                You are the IMPOSTOR
              </h1>
              <p className="mt-4 text-zinc-400 font-bold tracking-widest uppercase">Blend in. Don't let them know you have no idea what the word is.</p>
            </div>
          ) : (
            <div>
               <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2">The Secret Word is</p>
               <h1 className="text-4xl md:text-6xl font-black leading-tight text-white italic uppercase tracking-tighter flex items-center justify-center gap-4">
                 <Search size={40} className="text-cyan-400" /> {room.answer || "Pizza"}
               </h1>
            </div>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "DAY" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h3 className="text-2xl font-black italic uppercase mb-2">Interrogation Phase</h3>
                 <p className="text-zinc-400 max-w-lg mx-auto">Take turns describing the word. If you're the impostor, pay close attention to what others are saying!</p>
                 <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.values(room.players).map(p => (
                      <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                        <div className="size-12 rounded-full bg-zinc-800 grid place-items-center mb-2 font-black">
                          {p.username[0].toUpperCase()}
                        </div>
                        <div className="text-xs font-bold truncate w-full text-center">{p.username}</div>
                      </div>
                    ))}
                 </div>
              </div>
            </Panel>
          )}

          {room.phase === "VOTING" && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
               {Object.values(room.players).map((player) => (
                 <button
                   key={player.id}
                   onClick={() => handleVote(player.id)}
                   disabled={hasVoted || player.id === userId}
                   className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : player.id === userId ? "border-rose-500/10 bg-rose-500/5 cursor-default" : "border-white/10 bg-zinc-900/40 hover:border-rose-400/50 hover:bg-rose-500/5 hover:scale-[1.02]"}`}
                 >
                   <div className="size-16 rounded-full bg-zinc-800 grid place-items-center mb-4 transition-colors group-hover:bg-zinc-700">
                     <UserX size={24} className="text-zinc-500 group-hover:text-rose-400" />
                   </div>
                   <div className="text-lg font-black text-white">{player.username}</div>
                   {!hasVoted && player.id !== userId && (
                     <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-rose-400">Accuse Player</div>
                   )}
                 </button>
               ))}
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12">The Reveal</h2>
                 <div className="grid gap-6 max-w-xl mx-auto">
                    {Object.values(room.players).filter(p => p.role === "IMPOSTOR").map(p => (
                      <div key={p.id} className="p-8 rounded-3xl bg-rose-500 text-zinc-950 shadow-xl shadow-rose-500/20">
                         <div className="text-sm font-black uppercase tracking-widest opacity-60">The Impostor was</div>
                         <div className="text-4xl font-black mt-2 italic uppercase">{p.username}</div>
                      </div>
                    ))}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                       <div className="text-xs font-black uppercase text-zinc-500 tracking-widest">The Secret Word was</div>
                       <div className="text-2xl font-black text-white mt-1 uppercase">{room.answer}</div>
                    </div>
                 </div>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-5">
             <div className="space-y-6">
               <Metric label="Phase" value={room.phase} />
               <Metric label="Time" value={`${room.timer}s`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <ShieldAlert size={12} className="text-rose-400" /> Room Status
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(room.players).map(p => (
                      <div key={p.id} className={`size-8 rounded-lg border flex items-center justify-center font-black text-xs transition-all ${room.votes.some(v => v.voterId === p.id) ? "bg-emerald-500 border-emerald-400 text-zinc-950 scale-110" : "bg-white/5 border-white/10 text-zinc-500"}`}>
                        {p.username[0].toUpperCase()}
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
