"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Play, UserCheck, Settings, MessageCircle, Copy } from "lucide-react";
import { QrCard } from "@/components/qr-card";
import { sensory } from "@/lib/sensory";
import { motion } from "framer-motion";

export function Lobby({ room, userId }: { room: RoomState; userId: string }) {
  const isHost = room.hostId === userId;
  const players = Object.values(room.players);
  const readyCount = players.filter(p => p.isReady).length;

  function shareRoom(platform: "WHATSAPP" | "COPY") {
    const url = `${window.location.origin}/room/${room.code}`;
    const text = `Join my Partyverse arena! Code: ${room.code}`;
    
    if (platform === "WHATSAPP") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    } else {
      navigator.clipboard.writeText(url);
      sensory.playSfx("NOTIFICATION");
    }
  }

  return (
    <div className="grid h-full gap-6 content-start">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
          <QrCard code={room.code} />
          <h3 className="mt-6 text-2xl font-black italic uppercase tracking-tighter">Invite Squad</h3>
          <div className="mt-6 flex gap-2 w-full">
             <button onClick={() => shareRoom("WHATSAPP")} className="flex-1 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-all">
                <MessageCircle size={20} />
             </button>
             <button onClick={() => shareRoom("COPY")} className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all">
                <Copy size={20} />
             </button>
          </div>
        </Panel>

        <Panel className="p-8 flex flex-col justify-center border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
            <Settings size={14} className="text-cyan-400" /> Room Config
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="text-xs font-black uppercase text-zinc-400">Rounds</div>
                <div className="flex items-center gap-3">
                   <button disabled={!isHost} className="size-8 rounded-lg bg-white/5 flex items-center justify-center font-black">-</button>
                   <span className="font-mono font-black text-white">{room.settings.rounds}</span>
                   <button disabled={!isHost} className="size-8 rounded-lg bg-white/5 flex items-center justify-center font-black">+</button>
                </div>
             </div>
             <Metric label="Max Capacity" value={room.settings.maxPlayers.toString()} detail="Players allowed" />
             <Metric label="Game Engine" value={room.gameType || "---"} color="text-cyan-400" />
          </div>
        </Panel>

        <Panel className="p-8 flex flex-col items-center justify-center text-center border-white/5">
          <div className="grid size-16 place-items-center rounded-3xl bg-white/5 text-cyan-400 mb-6 shadow-xl">
            <UserCheck size={32} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tight">Readiness Check</h3>
          <p className="mt-2 text-xs font-medium text-zinc-500 mb-8 uppercase tracking-widest">{readyCount} / {players.length} Players Ready</p>
          <Button 
            onClick={() => {
              sensory.playSfx("POP");
              getSocket().emit("set_ready", { code: room.code, userId, ready: !room.players[userId]?.isReady });
            }}
            className={`w-full h-14 text-sm font-black uppercase italic tracking-widest transition-all ${room.players[userId]?.isReady ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-white text-zinc-950"}`}
          >
            {room.players[userId]?.isReady ? "Ready to Launch" : "I'm Ready"}
          </Button>
        </Panel>
      </div>

      {isHost && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="flex flex-col items-center gap-4 mt-8"
        >
          <Button 
            onClick={() => {
              sensory.playSfx("SUCCESS");
              getSocket().emit("start_game", { code: room.code, userId });
            }}
            className="h-20 px-16 text-2xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
            disabled={players.length < 1}
          >
            <Play size={28} className="fill-current mr-2" /> Start the Party
          </Button>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 animate-pulse">Establishing Neural Link...</p>
        </motion.div>
      )}
    </div>
  );
}
