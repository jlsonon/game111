"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Brain, CheckCircle2, HelpCircle, Trophy } from "lucide-react";
import { useState } from "react";

export function TriviaShowdown({ room, userId }: { room: RoomState; userId: string }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const hasSubmitted = !!room.submissions[userId];
  
  const options = room.submissions.options || ["Option A", "Option B", "Option C", "Option D"];

  function handleSelect(option: string) {
    if (hasSubmitted) return;
    setSelectedOption(option);
    getSocket().emit("submit_answer", { code: room.code, userId, answer: option });
    sensory.playSfx("POP");
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-amber-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-400 mb-4 flex items-center justify-center gap-2">
          <Brain size={16} /> Trivia Showdown Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
            {room.prompt}
          </h1>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "SUBMITTING" && (
            <div className="grid gap-4 sm:grid-cols-2">
               {options.map((option) => (
                 <button
                   key={option}
                   onClick={() => handleSelect(option)}
                   disabled={hasSubmitted}
                   className={`group relative flex items-center p-8 rounded-2xl border-2 transition-all ${selectedOption === option ? "border-amber-400 bg-amber-500/10" : hasSubmitted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-amber-400/50 hover:bg-amber-500/5 hover:scale-[1.02]"}`}
                 >
                   <div className={`grid size-10 place-items-center rounded-lg font-black text-xl mr-6 transition-colors ${selectedOption === option ? "bg-amber-400 text-zinc-900" : "bg-white/10 text-white"}`}>
                     {option[0]}
                   </div>
                   <div className="text-xl font-bold text-white text-left">{option}</div>
                 </button>
               ))}
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500">The correct answer is...</h3>
                 <h2 className="text-5xl font-black text-emerald-400 mt-4 uppercase italic">"{room.answer || "Option C"}"</h2>
                 
                 <div className="mt-12 space-y-4 max-w-xl mx-auto">
                    {Object.values(room.players).sort((a, b) => b.score - a.score).map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                           <div className="text-zinc-500 font-black text-sm w-4">{idx + 1}</div>
                           <div className="font-bold">{p.username}</div>
                           {room.submissions[p.id] === (room.answer || "Option C") && <CheckCircle2 size={16} className="text-emerald-400" />}
                        </div>
                        <div className="font-black text-amber-400">+{room.submissions[p.id] === (room.answer || "Option C") ? 100 : 0} pts</div>
                      </div>
                    ))}
                 </div>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-5">
             <div className="space-y-6">
               <Metric label="Time" value={`${room.timer}s`} />
               <Metric label="Streak" value="3x" detail="Speed Bonus Active" />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <Trophy size={12} className="text-amber-400" /> Leaderboard
                 </p>
                 <div className="space-y-2">
                    {Object.values(room.players).slice(0, 5).sort((a, b) => b.score - a.score).map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-400 truncate max-w-[120px]">{p.username}</span>
                        <span className="text-white">{p.score}</span>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
           </Panel>

           <Panel className="p-5 border-cyan-500/20 bg-cyan-500/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-4">
                <HelpCircle size={16} /> Fact
              </h3>
              <p className="text-xs font-medium text-cyan-200/80 leading-relaxed italic">
                Did you know? Trivia comes from the Latin word "trivialis," which means "commonplace" or "ordinary."
              </p>
           </Panel>
        </div>
      </div>
    </div>
  );
}
