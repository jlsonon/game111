"use client";

import { Button, GhostButton, Panel } from "@/components/ui";
import { games } from "@/lib/catalog";
import { getSocket } from "@/lib/socket";
import { roomCode } from "@/lib/utils";
import { usePartyverseStore } from "@/store/partyverse-store";
import { LogIn, Plus, QrCode, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { sensory } from "@/lib/sensory";

export function RoomLauncher() {
  const router = useRouter();
  const { profile, selectedGame } = usePartyverseStore();
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState(profile.username);
  const selected = useMemo(() => games.find((game) => game.type === selectedGame), [selectedGame]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    const onCreated = (code: string) => {
      sensory.playSfx("SUCCESS");
      router.push(`/room/${code}`);
    };
    socket.on("room_created", onCreated);
    return () => {
      socket.off("room_created", onCreated);
    };
  }, [router]);

  return (
    <motion.div 
      initial={{ x: 40, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ type: "spring", damping: 15 }}
    >
      <Panel className="p-6 sm:p-8 border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 blur-3xl size-48 bg-cyan-500/10 rounded-full" />
        
        <div className="flex items-center justify-between gap-4 relative">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-1 flex items-center gap-2">
              <Sparkles size={12} /> Instant Access
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Start {selected?.name ?? "a party"}</h2>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 sm:block shadow-inner">
            <QrCode size={32} className="text-zinc-400" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Identity</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your Party Name"
              className="h-14 w-full rounded-2xl border-2 border-white/5 bg-black/40 px-5 text-lg font-bold text-white outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
            />
          </div>

          <Button
            className="h-16 text-lg font-black uppercase italic tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 active:scale-95"
            onClick={() => {
              sensory.playSfx("POP");
              const socket = getSocket();
              socket.connect();
              socket.emit("create_room", { userId: profile.id, username: name || profile.username, gameType: selectedGame });
            }}
          >
            <Plus size={22} className="stroke-[3]" /> Create Arena
          </Button>

          <div className="relative my-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
             <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.5em] text-zinc-600 bg-transparent"><span className="bg-[#12141c] px-4">OR</span></div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input
              value={joinCode}
              maxLength={4}
              placeholder={roomCode()}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              className="h-14 rounded-2xl border-2 border-white/5 bg-black/40 px-5 text-center font-mono text-xl font-black tracking-[0.2em] text-cyan-300 outline-none transition-all focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 placeholder:text-zinc-800"
            />
            <GhostButton 
              className="h-14 px-8 rounded-2xl font-black uppercase italic tracking-widest border-2 border-white/5 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10"
              onClick={() => {
                if (joinCode.length >= 4) {
                  sensory.playSfx("POP");
                  router.push(`/room/${joinCode}`);
                } else {
                  sensory.vibrate([50, 50, 50]);
                }
              }}
            >
              <LogIn size={20} /> Join
            </GhostButton>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}
