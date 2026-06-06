"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Ghost, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";

export function BluffMaster({ room, userId }: { room: RoomState; userId: string }) {
  const [submission, setSubmission] = useState("");
  const hasSubmitted = !!room.submissions[userId];
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleSubmit() {
    if (!submission.trim()) return;
    getSocket().emit("submit_answer", { code: room.code, userId, answer: submission.trim() });
    setSubmission("");
  }

  function handleVote(targetId: string, value: string) {
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, value, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-zinc-900 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center justify-center gap-2">
          <Sparkles size={16} /> Bluff Master Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black leading-tight text-white italic">
            "{room.prompt}"
          </h1>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "SUBMITTING" && (
            <Panel className="p-8">
              {hasSubmitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                    <UserCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase">Bluff Locked In</h3>
                  <p className="mt-2 text-zinc-400 font-medium">Waiting for other players to finish their lies...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black">Submit your bluff</h3>
                    <p className="mt-1 text-sm text-zinc-400">Write a convincing lie that other players will believe is the correct answer.</p>
                  </div>
                  <textarea
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    placeholder="Enter your lie here..."
                    className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-black/40 p-5 text-lg font-bold text-white outline-none focus:border-cyan-400 transition-colors"
                  />
                  <Button onClick={handleSubmit} className="w-full h-14 text-lg font-black uppercase italic shadow-lg shadow-cyan-500/20">
                    Lock In Bluff
                  </Button>
                </div>
              )}
            </Panel>
          )}

          {room.phase === "VOTING" && (
            <div className="grid gap-4 md:grid-cols-2">
               {Object.entries(room.submissions).map(([submitterId, text]) => {
                 if (submitterId === userId) return null; // Can't vote for yourself
                 return (
                   <button 
                    key={submitterId} 
                    onClick={() => handleVote(submitterId, text)}
                    disabled={hasVoted}
                    className={`group relative flex flex-col items-start p-6 text-left rounded-2xl border-2 transition-all ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-cyan-400/50 hover:bg-cyan-500/5 hover:scale-[1.02]"}`}
                   >
                     <div className="text-lg font-bold text-white mb-2 leading-relaxed">"{text}"</div>
                     <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-cyan-400 transition-colors">Select this answer</div>
                   </button>
                 )
               })}
               {/* Add the real answer here (mocked for now, server should provide it) */}
               <button 
                  onClick={() => handleVote("system", room.answer || "Real Answer")}
                  disabled={hasVoted}
                  className={`group relative flex flex-col items-start p-6 text-left rounded-2xl border-2 transition-all ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : "border-white/10 bg-zinc-900/40 hover:border-emerald-400/50 hover:bg-emerald-500/5 hover:scale-[1.02]"}`}
               >
                 <div className="text-lg font-bold text-white mb-2 leading-relaxed">"{room.answer || "Real Answer"}"</div>
                 <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-emerald-400 transition-colors">Select this answer</div>
               </button>
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500">The truth is...</h3>
                 <h2 className="text-5xl font-black text-emerald-400 mt-4 italic">"{room.answer}"</h2>
                 
                 <div className="mt-12 grid gap-6 md:grid-cols-2">
                    {/* List who submitted what and who fell for it */}
                    {Object.entries(room.submissions).map(([submitterId, text]) => (
                      <div key={submitterId} className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-sm font-black text-cyan-400 uppercase tracking-wider">{room.players[submitterId]?.username}'s Lie</div>
                        <div className="mt-1 text-lg font-bold text-white">"{text}"</div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {room.votes.filter(v => v.targetId === submitterId).map(v => (
                            <span key={v.voterId} className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/30">
                              {room.players[v.voterId]?.username} was fooled
                            </span>
                          ))}
                        </div>
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
               <Metric label="Phase" value={room.phase} />
               <Metric label="Time" value={`${room.timer}s`} />
               <div>
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <Ghost size={12} /> Submission Status
                 </p>
                 <div className="grid grid-cols-4 gap-2">
                   {Object.values(room.players).map(p => (
                     <div key={p.id} title={p.username} className={`h-1.5 rounded-full transition-colors ${room.submissions[p.id] ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"}`} />
                   ))}
                 </div>
               </div>
             </div>
           </Panel>

           <Panel className="p-5 border-amber-500/20 bg-amber-500/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-4">
                <ShieldAlert size={16} /> Tip
              </h3>
              <p className="text-sm font-medium text-amber-200/80 leading-relaxed italic">
                {room.phase === "SUBMITTING" 
                  ? "Try to use vocabulary that matches the prompt to sound more official." 
                  : "If an answer sounds too crazy to be true, it might just be the real one!"}
              </p>
           </Panel>
        </div>
      </div>
    </div>
  );
}
