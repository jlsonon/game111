"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { ImageIcon, Laugh, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";

export function MemeBattle({ room, userId }: { room: RoomState; userId: string }) {
  const [caption, setCaption] = useState("");
  const hasSubmitted = !!room.submissions[userId];
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleSubmit() {
    if (!caption.trim()) return;
    getSocket().emit("submit_answer", { code: room.code, userId, answer: caption.trim() });
    setCaption("");
  }

  function handleVote(targetId: string) {
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, createdAt: Date.now() } 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-indigo-900/40 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 flex items-center justify-center gap-2">
          <Laugh size={16} /> Meme Battle Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black leading-tight text-white italic uppercase tracking-tight">
            "{room.prompt}"
          </h1>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "SUBMITTING" && (
            <Panel className="p-8">
               <div className="grid gap-8 md:grid-cols-[1fr_280px]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black italic uppercase">Craft your caption</h3>
                      <p className="mt-1 text-sm text-zinc-400">Make it funny, making it relatable, make it win.</p>
                    </div>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Type your funny caption here..."
                      disabled={hasSubmitted}
                      className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-black/40 p-5 text-xl font-black text-white outline-none focus:border-indigo-400 transition-colors placeholder:text-zinc-700"
                    />
                    {!hasSubmitted && (
                      <Button onClick={handleSubmit} className="w-full h-14 text-lg font-black uppercase italic bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20">
                        Submit Meme
                      </Button>
                    )}
                  </div>
                  <div className="relative aspect-square rounded-2xl bg-zinc-800 flex items-center justify-center border-2 border-dashed border-white/10 text-zinc-500 overflow-hidden">
                    {/* Placeholder for actual meme template image */}
                    <div className="text-center p-4">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">Template Image<br/>(Coming Soon)</p>
                    </div>
                    {caption && (
                       <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10">
                         <p className="text-white font-black text-sm text-center uppercase tracking-tight line-clamp-2 italic">"{caption}"</p>
                       </div>
                    )}
                  </div>
               </div>
               {hasSubmitted && (
                 <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                   <UserCheck size={20} />
                   <span className="font-black uppercase italic tracking-wider">Meme Locked In! Waiting for others...</span>
                 </div>
               )}
            </Panel>
          )}

          {room.phase === "VOTING" && (
            <div className="grid gap-4 md:grid-cols-2">
               {Object.entries(room.submissions).map(([submitterId, text]) => (
                   <button 
                    key={submitterId} 
                    onClick={() => handleVote(submitterId)}
                    disabled={hasVoted || submitterId === userId}
                    className={`group relative flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 transition-all aspect-square ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : submitterId === userId ? "border-indigo-500/20 bg-indigo-500/5 cursor-default" : "border-white/10 bg-zinc-900/40 hover:border-indigo-400/50 hover:bg-indigo-500/5 hover:scale-[1.02]"}`}
                   >
                     <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-indigo-400 transition-colors">
                       {submitterId === userId ? "Your Entry" : `Meme #${Math.random().toString().slice(2, 5)}`}
                     </div>
                     <div className="text-2xl font-black text-white italic leading-tight uppercase px-2">"{text}"</div>
                     {!hasVoted && submitterId !== userId && (
                       <div className="mt-8 px-4 py-2 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-500 group-hover:text-zinc-950 transition-all">Vote for this</div>
                     )}
                   </button>
               ))}
            </div>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
              <div className="text-center">
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12">The Results</h2>
                 <div className="grid gap-4">
                    {Object.entries(room.submissions)
                      .sort((a, b) => (room.votes.filter(v => v.targetId === b[0]).length) - (room.votes.filter(v => v.targetId === a[0]).length))
                      .map(([submitterId, text], idx) => {
                        const voteCount = room.votes.filter(v => v.targetId === submitterId).length;
                        return (
                          <div key={submitterId} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${idx === 0 ? "bg-indigo-500 border-indigo-400 text-zinc-950 shadow-xl shadow-indigo-500/20" : "bg-white/5 border-white/10 text-white"}`}>
                            <div className="flex items-center gap-4">
                              <div className={`grid size-10 place-items-center rounded-lg font-black text-xl ${idx === 0 ? "bg-white text-zinc-900" : "bg-white/10"}`}>
                                {idx + 1}
                              </div>
                              <div className="text-left">
                                <div className={`text-sm font-black uppercase tracking-wider ${idx === 0 ? "text-zinc-900/60" : "text-zinc-500"}`}>{room.players[submitterId]?.username}</div>
                                <div className="text-xl font-black italic">"{text}"</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className={`text-3xl font-black ${idx === 0 ? "text-zinc-950" : "text-indigo-400"}`}>{voteCount}</div>
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
                   <Sparkles size={12} className="text-indigo-400" /> Battle Progress
                 </p>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${(Object.keys(room.submissions).length / Object.values(room.players).length) * 100}%` }} 
                   />
                 </div>
                 <p className="mt-2 text-[10px] font-bold text-zinc-500 text-right uppercase">{Object.keys(room.submissions).length} / {Object.values(room.players).length} Memes Ready</p>
               </div>
             </div>
           </Panel>
        </div>
      </div>
    </div>
  );
}
