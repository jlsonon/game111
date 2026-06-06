"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, X } from "lucide-react";
import { useEffect, useState } from "react";
import { sensory } from "@/lib/sensory";

interface Toast {
  id: string;
  title: string;
  description: string;
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // We could use an event emitter here, but for now we'll mock a trigger
  useEffect(() => {
    (window as any).triggerAchievement = (title: string, description: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, title, description }]);
      sensory.playSfx("SUCCESS");
      sensory.vibrate([100, 50, 100]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="group relative flex items-center gap-4 min-w-[300px] p-4 rounded-2xl bg-zinc-900 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10 backdrop-blur-xl"
          >
            <div className="grid size-12 place-items-center rounded-xl bg-amber-400 text-zinc-950">
              <Award size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">Achievement Unlocked</div>
              <div className="text-sm font-black text-white uppercase italic">{toast.title}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{toast.description}</div>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
