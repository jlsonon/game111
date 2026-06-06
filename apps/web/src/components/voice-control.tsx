"use client";

import { useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { sensory } from "@/lib/sensory";
import { motion } from "framer-motion";

export function VoiceControl() {
  const [isMuted, setIsMuted] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  async function toggleMic() {
    if (!hasPermission) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (e) {
        console.error("Mic permission denied", e);
        return;
      }
    }
    
    sensory.playSfx("POP");
    setIsMuted(!isMuted);
    sensory.vibrate(10);
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
      <button 
        onClick={toggleMic}
        className={`size-10 rounded-xl flex items-center justify-center transition-all ${isMuted ? "bg-zinc-800 text-zinc-500" : "bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20"}`}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Voice Link</div>
        <div className="text-xs font-bold text-white uppercase italic">{isMuted ? "Signal Muted" : "Broadcasting..."}</div>
      </div>
      {!isMuted && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 1, repeat: Infinity }}
          className="size-2 rounded-full bg-cyan-400 mr-2 shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
        />
      )}
    </div>
  );
}
