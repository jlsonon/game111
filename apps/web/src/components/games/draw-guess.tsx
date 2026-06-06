"use client";

import { DrawingBoard } from "@/components/drawing-board";
import { Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { DrawingStroke, RoomState } from "@partyverse/shared";
import { Palette, Type } from "lucide-react";

export function DrawGuess({ room, userId }: { room: RoomState; userId: string }) {
  const isDrawing = room.activePlayerId === userId;
  const activePlayer = room.players[room.activePlayerId || ""];

  function emitStroke(stroke: DrawingStroke) {
    getSocket().emit("draw_stroke", { code: room.code, stroke });
  }

  function handleUndo() {
    getSocket().emit("undo_stroke", { code: room.code, userId });
  }

  return (
    <div className="grid gap-6 h-full content-start">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Panel className="p-4 border-2 border-white/5 overflow-hidden">
            <DrawingBoard
              userId={userId}
              strokes={room.strokes}
              onStroke={isDrawing ? emitStroke : undefined}
              onUndo={isDrawing ? handleUndo : undefined}
              readOnly={!isDrawing}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5 bg-gradient-to-br from-fuchsia-500/10 to-transparent border-fuchsia-500/20">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-400 flex items-center gap-2">
              <Palette size={16} /> Status
            </h3>
            <div className="mt-4">
              {isDrawing ? (
                <div>
                  <p className="text-xs font-black uppercase text-zinc-500 tracking-wider">Your Secret Word</p>
                  <h2 className="text-3xl font-black text-white mt-1 uppercase italic">{room.prompt}</h2>
                  <p className="mt-4 text-sm text-zinc-400 font-medium">Draw this as fast as you can. Others are trying to guess it!</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-black uppercase text-zinc-500 tracking-wider">Now Drawing</p>
                  <h2 className="text-2xl font-black text-white mt-1 italic">{activePlayer?.username || "Someone"}</h2>
                  <p className="mt-4 text-sm text-zinc-400 font-medium italic">"Type your guesses in the chat!"</p>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
              <Type size={16} /> Round {room.round}
            </h3>
            <div className="mt-4 space-y-4">
               <Metric label="Time Remaining" value={`${room.timer}s`} />
               <div className="pt-2">
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Players guessed</p>
                 <div className="flex flex-wrap gap-2">
                   {Object.values(room.players).map(p => (
                     <div key={p.id} className={`size-8 rounded-lg border flex items-center justify-center font-black text-xs transition-colors ${room.chat.some(m => m.userId === p.id && m.kind === "SYSTEM") ? "bg-emerald-500 border-emerald-400 text-zinc-950 scale-110" : "bg-white/5 border-white/10 text-zinc-500"}`}>
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
