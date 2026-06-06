"use client";

import { DrawingBoard } from "@/components/drawing-board";
import { Metric, Panel, Button } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { DrawingStroke, RoomState } from "@partyverse/shared";
import { MessageSquare, Palette, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sensory } from "@/lib/sensory";
import { useState } from "react";

export function TelephoneDrawing({ room, userId }: { room: RoomState; userId: string }) {
  const [submission, setSubmission] = useState("");
  const hasSubmitted = !!room.submissions[userId];
  
  // Logic to determine what the player should see based on the "Relay Chain"
  // In Telephone Drawing, you always act on the data from the 'previous' player in the circle
  const players = Object.values(room.players);
  const myIndex = players.findIndex(p => p.id === userId);
  const prevPlayerIndex = (myIndex - 1 + players.length) % players.length;
  const prevPlayerId = players[prevPlayerIndex].id;

  function handleSubmitText() {
    if (!submission.trim()) return;
    getSocket().emit("submit_answer", { code: room.code, userId, answer: submission.trim() });
    setSubmission("");
  }

  function emitStroke(stroke: DrawingStroke) {
    getSocket().emit("draw_stroke", { code: room.code, stroke });
  }

  function handleUndo() {
    getSocket().emit("undo_stroke", { code: room.code, userId });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <Panel className="p-8 text-center bg-gradient-to-br from-cyan-900/20 to-black border-white/5 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin-slow" /> Telephone Chain Round {room.round}
        </h2>
        <h1 className="text-3xl md:text-5xl font-black leading-tight text-white uppercase italic tracking-tighter">
          {room.phase === "SUBMITTING" ? "Start the Chain" : room.phase === "DRAWING" ? "Draw the Guess" : "Guess the Drawing"}
        </h1>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {room.phase === "SUBMITTING" && (
            <Panel className="p-12 text-center">
               {!hasSubmitted ? (
                 <div className="max-w-md mx-auto space-y-6">
                    <h3 className="text-xl font-black italic text-zinc-400 uppercase">Write a weird prompt</h3>
                    <input 
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      placeholder="e.g. A cat drinking bubble tea"
                      className="w-full h-16 rounded-2xl border-2 border-white/5 bg-black/40 px-6 text-xl font-bold text-white outline-none focus:border-cyan-400 transition-all"
                    />
                    <Button onClick={handleSubmitText} className="w-full h-14 bg-cyan-500 text-zinc-950 font-black uppercase">Inject into Chain</Button>
                 </div>
               ) : (
                 <div className="py-12">
                    <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-400 grid place-items-center mx-auto mb-6 border-2 border-emerald-500/20">
                       <Sparkles size={40} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase">Prompt Locked In</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-sm">Waiting for others to finish their origins...</p>
                 </div>
               )}
            </Panel>
          )}

          {room.phase === "DRAWING" && (
            <div className="space-y-6">
              <Panel className="p-4 border-2 border-white/10 shadow-2xl">
                 <div className="mb-4 flex items-center justify-between px-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Prompt to Draw:</div>
                    <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black italic text-sm">
                      {room.submissions[prevPlayerId]?.answer || "Something mysterious..."}
                    </div>
                 </div>
                 <DrawingBoard 
                   userId={userId}
                   strokes={room.strokes.filter(s => s.userId === userId)}
                   onStroke={emitStroke}
                   onUndo={handleUndo}
                 />
              </Panel>
            </div>
          )}

          {room.phase === "GUESSING" && (
            <Panel className="p-8">
               <div className="grid gap-8 md:grid-cols-2 items-center">
                  <div className="aspect-[4/3] rounded-2xl bg-white p-2 shadow-inner pointer-events-none">
                     <DrawingBoard 
                       userId="viewer"
                       strokes={room.strokes.filter(s => s.userId === prevPlayerId)}
                       readOnly
                     />
                  </div>
                  <div className="space-y-6">
                     {!hasSubmitted ? (
                        <>
                          <div>
                            <h3 className="text-2xl font-black italic uppercase text-white">What is this?</h3>
                            <p className="text-sm text-zinc-500 font-medium">Study the drawing and type your best guess below.</p>
                          </div>
                          <input 
                            value={submission}
                            onChange={(e) => setSubmission(e.target.value)}
                            placeholder="Type your guess..."
                            className="w-full h-14 rounded-xl border-2 border-white/5 bg-black/40 px-5 text-lg font-bold text-white outline-none focus:border-fuchsia-500"
                          />
                          <Button onClick={handleSubmitText} className="w-full h-14 bg-fuchsia-500 text-white font-black uppercase shadow-lg shadow-fuchsia-500/20">Lock Guess</Button>
                        </>
                     ) : (
                        <div className="text-center py-10">
                           <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto mb-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                              <MessageSquare size={32} />
                           </div>
                           <h3 className="text-xl font-black uppercase italic">Guess Recorded</h3>
                           <p className="mt-2 text-xs font-bold text-zinc-600 uppercase tracking-tighter">Waiting for the chain to complete...</p>
                        </div>
                     )}
                  </div>
               </div>
            </Panel>
          )}

          {room.phase === "REVEAL" && (
            <Panel className="p-8">
               <div className="text-center">
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-12">The Evolution</h2>
                  {/* Sequence visualization logic would go here */}
                  <div className="flex flex-col items-center gap-12 max-w-2xl mx-auto">
                     {players.map((p, idx) => (
                        <div key={p.id} className="w-full relative">
                           {idx > 0 && <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-white/10 to-transparent" />}
                           <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 shadow-xl">
                              <div className="size-12 rounded-2xl bg-zinc-800 grid place-items-center font-black text-white">{idx + 1}</div>
                              <div className="text-left flex-1">
                                 <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">{p.username}'s Part</div>
                                 <div className="text-xl font-black italic uppercase text-cyan-400">"{room.submissions[p.id]?.answer || "..."}"</div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
           <Panel className="p-6 border-t-4 border-cyan-500/20">
             <div className="space-y-6">
               <Metric label="Phase" value={room.phase} />
               <Metric label="Chain Timer" value={`${room.timer}s`} color={room.timer < 10 ? "text-rose-500" : "text-cyan-400"} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                   <Sparkles size={14} className="text-amber-400" /> Link Integrity
                 </p>
                 <div className="grid grid-cols-2 gap-3">
                    {players.map(p => (
                      <div key={p.id} className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${room.submissions[p.id] ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                        <div className={`size-2 rounded-full ${room.submissions[p.id] ? "bg-emerald-400" : "bg-white/20"}`} />
                        <span className={`text-[10px] font-black uppercase truncate ${room.submissions[p.id] ? "text-emerald-400" : "text-zinc-600"}`}>{p.username}</span>
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
