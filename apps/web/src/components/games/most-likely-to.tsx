"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Sparkles, Users, Vote } from "lucide-react";

export function MostLikelyTo({ room, userId }: { room: RoomState; userId: string }) {
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
      <Panel className="p-8 text-center bg-gradient-to-br from-purple-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-400 mb-4 flex items-center justify-center gap-2">
          <Sparkles size={16} /> Most Likely To Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2">Who is</p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white italic uppercase">
            "{room.prompt}"
          </h1>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "VOTING" && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
               {Object.values(room.players).map((player) => (
                 <button
                   key={player.id}
                   onClick={() => handleVote(player.id)}
                   disabled={hasVoted}
                   className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-purple-400/50 hover:bg-purple-500/5 hover:scale-[1.02]"}`}
                 >
                   <div className="size-16 rounded-full bg-zinc-800 grid place-items-center mb-4 transition-colors group-hover:bg-zinc-700">
                     <span className="text-2xl font-black">{player.username[0].toUpperCase()}</span>
                   </div>
                   <div className="text-lg font-black text-white truncate w-full text-center">{player.username}</div>
                   {!hasVoted && (
                     <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-purple-400">Vote for them</div>
                   )}
                 </button>
               ))}
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-12">The Verdict</h2>
                 <div className="grid gap-4 max-w-2xl mx-auto">
                    {Object.values(room.players)
                      .sort((a, b) => (room.votes.filter(v => v.targetId === b.id).length) - (room.votes.filter(v => v.targetId === a.id).length))
                      .map((p, idx) => {
                        const voteCount = room.votes.filter(v => v.targetId === p.id).length;
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${idx === 0 ? "bg-purple-500 border-purple-400 text-zinc-950 shadow-xl shadow-purple-500/20" : "bg-white/5 border-white/10 text-white"}`}>
                            <div className="flex items-center gap-4">
                              <div className={`grid size-10 place-items-center rounded-lg font-black text-xl ${idx === 0 ? "bg-white text-zinc-900" : "bg-white/10"}`}>
                                {idx + 1}
                              </div>
                              <div className="text-left font-black text-xl italic uppercase">{p.username}</div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className={`text-3xl font-black ${idx === 0 ? "text-zinc-950" : "text-purple-400"}`}>{voteCount}</div>
                               <div className={`text-[10px] font-black uppercase tracking-tighter ${idx === 0 ? "text-zinc-900/60" : "text-zinc-500"}`}>Votes</div>
                            </div>
                          </div>
                        );
                      })}
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
                   <Vote size={12} className="text-purple-400" /> Voting Progress
                 </p>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-purple-500 transition-all duration-500" 
                    style={{ width: `${(room.votes.length / Object.values(room.players).length) * 100}%` }} 
                   />
                 </div>
                 <p className="mt-2 text-[10px] font-bold text-zinc-500 text-right uppercase">{room.votes.length} / {Object.values(room.players).length} Votes Cast</p>
               </div>
             </div>
           </Panel>
        </div>
      </div>
    </div>
  );
}
