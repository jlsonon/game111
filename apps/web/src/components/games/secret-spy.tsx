"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Eye, HelpCircle, MapPin, Search, UserCheck } from "lucide-react";
import { useState } from "react";

export function SecretSpy({ room, userId }: { room: RoomState; userId: string }) {
  const [selectedSpy, setSelectedSpy] = useState<string | null>(null);
  const [spyGuess, setSpyGuess] = useState("");
  const isSpy = room.players[userId]?.role === "SPY";
  const hasVoted = room.votes.some(v => v.voterId === userId);

  function handleVote(targetId: string) {
    if (hasVoted) return;
    getSocket().emit("cast_vote", { 
      code: room.code, 
      vote: { id: crypto.randomUUID(), voterId: userId, targetId, createdAt: Date.now() } 
    });
  }

  function handleSpyGuess() {
    getSocket().emit("submit_answer", { code: room.code, userId, answer: spyGuess });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-emerald-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 mb-4 flex items-center justify-center gap-2">
          <Eye size={16} /> Secret Spy Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          {isSpy ? (
            <div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight text-rose-500 italic uppercase">
                You are the SPY!
              </h1>
              <p className="mt-4 text-zinc-400 font-bold tracking-wider uppercase">Don't let them know you have no idea where you are.</p>
            </div>
          ) : (
            <div>
               <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-2">The Location is</p>
               <h1 className="text-4xl md:text-5xl font-black leading-tight text-white italic uppercase flex items-center justify-center gap-3">
                 <MapPin size={32} className="text-emerald-400" /> {room.location || "Secret Base"}
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
                 <p className="text-zinc-400 max-w-lg mx-auto">Ask each other questions to find the spy. Be careful! Don't reveal too much about the location or the spy will guess it.</p>
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
                   className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${hasVoted ? "opacity-50 border-white/5 bg-white/5 cursor-not-allowed" : player.id === userId ? "border-emerald-500/10 bg-emerald-500/5 cursor-default" : "border-white/10 bg-zinc-900/40 hover:border-emerald-400/50 hover:bg-emerald-500/5 hover:scale-[1.02]"}`}
                 >
                   <div className="size-16 rounded-full bg-zinc-800 grid place-items-center mb-4 transition-colors group-hover:bg-zinc-700">
                     <Search size={24} className="text-zinc-500 group-hover:text-emerald-400" />
                   </div>
                   <div className="text-lg font-black text-white">{player.username}</div>
                   {!hasVoted && player.id !== userId && (
                     <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-400">Accuse Player</div>
                   )}
                 </button>
               ))}
            </div>
          )}

          {room.phase === "SPY_GUESS" && (
             <Panel className="p-8">
               {isSpy ? (
                 <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-black italic uppercase">You've been caught!</h3>
                      <p className="mt-1 text-zinc-400">But you can still win! Guess the location correctly to steal the victory.</p>
                    </div>
                    <input 
                      value={spyGuess}
                      onChange={(e) => setSpyGuess(e.target.value)}
                      placeholder="Enter the location name..."
                      className="w-full h-14 rounded-xl border border-white/10 bg-black/40 px-5 text-xl font-bold text-white outline-none focus:border-emerald-400"
                    />
                    <Button onClick={handleSpyGuess} className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase">
                      Final Guess
                    </Button>
                 </div>
               ) : (
                 <div className="text-center py-10">
                    <div className="animate-bounce mb-6">
                      <HelpCircle size={48} className="mx-auto text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase">The Spy is Guessing...</h3>
                    <p className="mt-2 text-zinc-400">Hold your breath. If they guess "{room.location}", you lose!</p>
                 </div>
               )}
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
                   <UserCheck size={12} className="text-emerald-400" /> Accusations
                 </p>
                 <div className="space-y-2">
                    {room.votes.map(v => (
                      <div key={v.id} className="text-[10px] font-bold text-zinc-400 italic">
                        {room.players[v.voterId]?.username} accused {room.players[v.targetId]?.username}
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
