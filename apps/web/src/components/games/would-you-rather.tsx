"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { ArrowRightLeft, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";

export function WouldYouRather({ room, userId }: { room: RoomState; userId: string }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasVoted = room.votes.some(v => v.voterId === userId);
  
  const options = room.prompt?.split(" or ") || ["Option A", "Option B"];

  function handleVote(value: string) {
    if (hasVoted) return;
    setSelectedOption(value);
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId: "system", value, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-rose-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-rose-400 mb-4 flex items-center justify-center gap-2">
          <ArrowRightLeft size={16} /> Would You Rather Round {room.round}
        </h2>
        <h1 className="text-3xl md:text-5xl font-black leading-tight text-white uppercase italic">
          The Big Choice
        </h1>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "VOTING" && (
            <div className="grid gap-6 md:grid-cols-2 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:grid size-12 place-items-center rounded-full bg-zinc-950 border border-white/10 font-black text-sm italic">OR</div>
               
               {options.map((option, idx) => (
                 <button
                   key={option}
                   onClick={() => handleVote(option)}
                   disabled={hasVoted}
                   className={`group relative flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] border-4 transition-all min-h-[300px] ${selectedOption === option ? (idx === 0 ? "border-cyan-400 bg-cyan-500/10" : "border-fuchsia-400 bg-fuchsia-500/10") : hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : idx === 0 ? "border-white/10 bg-zinc-900/40 hover:border-cyan-400/50 hover:bg-cyan-500/5 hover:scale-[1.02]" : "border-white/10 bg-zinc-900/40 hover:border-fuchsia-400/50 hover:bg-fuchsia-500/5 hover:scale-[1.02]"}`}
                 >
                   <div className="text-3xl font-black text-white italic leading-tight uppercase">"{option.replace("?", "")}"</div>
                   {!hasVoted && (
                     <div className={`mt-8 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${idx === 0 ? "bg-cyan-500 text-zinc-950" : "bg-fuchsia-500 text-zinc-950"}`}>Pick this</div>
                   )}
                 </button>
               ))}
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">The Room Decided</h2>
               </div>
               
               <div className="grid gap-8 max-w-3xl mx-auto">
                 {options.map((option, idx) => {
                   const voteCount = room.votes.filter(v => v.value === option).length;
                   const percentage = room.votes.length > 0 ? Math.round((voteCount / room.votes.length) * 100) : 0;
                   return (
                     <div key={option} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <div className="text-xl font-black text-white italic uppercase truncate max-w-[80%]">"{option}"</div>
                           <div className={`text-4xl font-black ${idx === 0 ? "text-cyan-400" : "text-fuchsia-400"}`}>{percentage}%</div>
                        </div>
                        <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div 
                             className={`h-full transition-all duration-1000 ease-out ${idx === 0 ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"}`}
                             style={{ width: `${percentage}%` }}
                           />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                           {room.votes.filter(v => v.value === option).map(v => (
                             <div key={v.voterId} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-zinc-400">
                               {room.players[v.voterId]?.username}
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                 })}
               </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-5">
             <div className="space-y-6">
               <Metric label="Time" value={`${room.timer}s`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <UserCheck size={12} className="text-rose-400" /> Voting Status
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

           <Panel className="p-5 border-amber-500/20 bg-amber-500/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-4">
                <Sparkles size={16} /> Insight
              </h3>
              <p className="text-xs font-medium text-amber-200/80 leading-relaxed italic">
                This game reveals who in your group thinks alike. Are you part of the majority or a wild outlier?
              </p>
           </Panel>
        </div>
      </div>
    </div>
  );
}
