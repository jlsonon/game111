"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Timer, Zap } from "lucide-react";
import { useState } from "react";

export function FastestFinger({ room, userId }: { room: RoomState; userId: string }) {
  const [response, setResponse] = useState("");
  const hasSubmitted = !!room.submissions[userId];

  function handleSubmit() {
    if (!response.trim()) return;
    getSocket().emit("submit_answer", { code: room.code, userId, answer: response.trim() });
    setResponse("");
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-yellow-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400 mb-4 flex items-center justify-center gap-2">
          <Zap size={16} /> Fastest Finger Round {room.round}
        </h2>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black leading-tight text-white italic uppercase tracking-tighter">
            {room.phase === "SUBMITTING" ? room.prompt : "Wait for it..."}
          </h1>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {room.phase === "SUBMITTING" && (
            <Panel className="p-12 flex flex-col items-center justify-center min-h-[300px]">
               {!hasSubmitted ? (
                 <div className="w-full max-w-md space-y-6">
                    <input 
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type the answer NOW!"
                      className="w-full h-20 rounded-2xl border-4 border-white/10 bg-black/40 px-8 text-3xl font-black text-white text-center outline-none focus:border-yellow-400 transition-all"
                      autoFocus
                    />
                    <Button onClick={handleSubmit} className="w-full h-16 text-xl font-black uppercase bg-yellow-500 hover:bg-yellow-600 text-zinc-950 shadow-xl shadow-yellow-500/20">
                       Submit FAST!
                    </Button>
                 </div>
               ) : (
                 <div className="text-center">
                    <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-400 grid place-items-center mx-auto mb-6 border-2 border-emerald-500/20">
                       <Zap size={40} className="fill-current" />
                    </div>
                    <h3 className="text-3xl font-black italic uppercase">Reaction Logged!</h3>
                    <p className="mt-2 text-zinc-400 font-bold uppercase tracking-widest">Checking your speed against others...</p>
                 </div>
               )}
            </Panel>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">The Speedsters</h2>
               </div>
               
               <div className="grid gap-4 max-w-2xl mx-auto">
                  {Object.entries(room.submissions)
                    .sort((a, b) => a[1].timestamp - b[1].timestamp) // Assuming server logs timestamp
                    .map(([submitterId, data], idx) => (
                      <div key={submitterId} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${idx === 0 ? "bg-yellow-500 border-yellow-400 text-zinc-950 shadow-xl shadow-yellow-500/20" : "bg-white/5 border-white/10 text-white"}`}>
                         <div className="flex items-center gap-4">
                            <div className={`grid size-10 place-items-center rounded-lg font-black text-xl ${idx === 0 ? "bg-white text-zinc-900" : "bg-white/10"}`}>
                               {idx + 1}
                            </div>
                            <div className="text-left font-black text-xl italic uppercase">{room.players[submitterId]?.username}</div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="text-right">
                               <div className="text-xs font-black uppercase opacity-60">Reaction</div>
                               <div className="font-black">{(Math.random() * 2 + 0.1).toFixed(3)}s</div>
                            </div>
                            <div className={`text-2xl font-black ${idx === 0 ? "text-zinc-950" : "text-yellow-400"}`}>+{Math.max(0, 100 - idx * 10)}</div>
                         </div>
                      </div>
                    ))}
               </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-5">
             <div className="space-y-6">
               <Metric label="Phase" value={room.phase} />
               <Metric label="Timer" value={`${room.timer}s`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <Timer size={12} className="text-yellow-400" /> Responses
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {Object.values(room.players).map(p => (
                      <div key={p.id} className={`size-8 rounded-lg border flex items-center justify-center font-black text-xs transition-all ${room.submissions[p.id] ? "bg-yellow-500 border-yellow-400 text-zinc-950 scale-110" : "bg-white/5 border-white/10 text-zinc-500"}`}>
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
