"use client";

import { DrawingBoard } from "@/components/drawing-board";
import { Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { DrawingStroke, RoomState } from "@partyverse/shared";
import { Palette, Sparkles, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sensory } from "@/lib/sensory";

export function DrawGuess({ room, userId }: { room: RoomState; userId: string }) {
  const isDrawing = room.activePlayerId === userId;
  const activePlayer = room.players[room.activePlayerId || ""];
  const hasGuessed = room.chat.some(m => m.userId === userId && m.kind === "SYSTEM" && m.message.includes("guessed correctly"));

  function emitStroke(stroke: DrawingStroke) {
    getSocket().emit("draw_stroke", { code: room.code, stroke });
  }

  function handleUndo() {
    getSocket().emit("undo_stroke", { code: room.code, userId });
    sensory.vibrate(5);
  }

  const reactions = ["🔥", "😂", "🤔", "👏", "💩", "🎨"];

  function sendReaction(emoji: string) {
    sensory.playSfx("POP");
    getSocket().emit("send_guess", { 
      code: room.code, 
      userId, 
      username: room.players[userId].username, 
      message: emoji 
    });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Panel className="p-4 border-2 border-white/5 overflow-hidden shadow-2xl relative">
            <DrawingBoard
              userId={userId}
              strokes={room.strokes}
              onStroke={isDrawing ? emitStroke : undefined}
              onUndo={isDrawing ? handleUndo : undefined}
              readOnly={!isDrawing}
            />
            
            {/* Floating Reactions Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <AnimatePresence>
                 {room.chat.filter(m => reactions.includes(m.message) && Date.now() - m.createdAt < 3000).map(m => (
                   <motion.div
                     key={m.id}
                     initial={{ y: 400, x: Math.random() * 400, opacity: 0, scale: 0.5 }}
                     animate={{ y: -100, opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 1] }}
                     transition={{ duration: 3, ease: "easeOut" }}
                     className="absolute text-4xl"
                   >
                     {m.message}
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          </Panel>

          {(hasGuessed || !isDrawing) && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Panel className="p-4 flex items-center justify-between bg-white/5 border-dashed border-white/10">
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Reactions</div>
                <div className="flex gap-2">
                  {reactions.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => sendReaction(emoji)}
                      className="size-10 rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-90 transition-all text-xl grid place-items-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <Panel className="p-6 bg-gradient-to-br from-fuchsia-500/10 to-transparent border-fuchsia-500/20 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-400 flex items-center gap-2">
              <Palette size={14} /> Intelligence
            </h3>
            <div className="mt-5">
              {isDrawing ? (
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Your Secret Word</p>
                  <h2 className="text-4xl font-black text-white mt-1 uppercase italic tracking-tighter">{room.prompt}</h2>
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 leading-relaxed italic">
                    Draw this as fast as you can. Points are awarded based on how many people guess it!
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Master Artist</p>
                  <h2 className="text-3xl font-black text-white mt-1 italic tracking-tight uppercase truncate">{activePlayer?.username || "Someone"}</h2>
                  <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                     <div className="size-2 bg-cyan-400 rounded-full animate-ping" />
                     <p className="text-xs font-black text-cyan-100 uppercase tracking-widest">Guess the word in chat!</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-6 border-t-4 border-cyan-500/20">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
              <Type size={14} /> Round Status
            </h3>
            <div className="mt-6 space-y-6">
               <Metric label="Time Left" value={`${room.timer}s`} />
               <div>
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 flex items-center gap-2">
                   <Sparkles size={12} /> Solved By
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {Object.values(room.players).map(p => {
                     const solved = room.chat.some(m => m.userId === p.id && m.kind === "SYSTEM");
                     return (
                       <motion.div 
                        key={p.id} 
                        animate={solved ? { scale: [1, 1.2, 1] } : {}}
                        className={`size-9 rounded-xl border flex items-center justify-center font-black text-xs transition-all ${solved ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 text-zinc-600"}`}
                       >
                         {p.username[0].toUpperCase()}
                       </motion.div>
                     );
                   })}
                 </div>
               </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
