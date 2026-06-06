"use client";

import { Button, GhostButton, Panel } from "@/components/ui";
import { Download, Smartphone, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sensory } from "@/lib/sensory";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    sensory.playSfx("POP");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <Panel className="p-6 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border-cyan-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <Smartphone size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6 text-center md:text-left flex-1">
                <div className="grid size-16 place-items-center rounded-2xl bg-cyan-400 text-zinc-950 shadow-xl shadow-cyan-500/20">
                  <Download size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Native Arena Experience</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-400 max-w-md">Install Partyverse to your home screen for full-screen immersive play and faster neural linking.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <GhostButton onClick={() => setIsVisible(false)} className="h-14 px-8 border-white/5 text-zinc-500 uppercase font-black italic tracking-widest text-xs">Maybe Later</GhostButton>
                <Button onClick={handleInstall} className="h-14 px-10 bg-white text-zinc-950 font-black uppercase italic tracking-widest text-sm flex-1 md:flex-none shadow-2xl">Install Now</Button>
              </div>
            </div>
          </Panel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
