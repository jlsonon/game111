"use client";

import { GameGrid } from "@/components/game-grid";
import { InstallPrompt } from "@/components/install-prompt";
import { RoomLauncher } from "@/components/room-launcher";
import { Metric, Panel, SectionHeader } from "@/components/ui";
import { achievements, galleryMoments, leaderboardEntries } from "@/lib/catalog";
import { Activity, Crown, ShieldCheck, Sparkles, Users, Zap, Globe, ZapOff, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#090a12]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] size-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[20%] right-[-5%] size-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:items-center lg:py-12">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          >
            <Zap size={14} className="fill-cyan-400" /> V2.0 Engine Now Live
          </motion.div>
          <h1 className="mt-8 max-w-5xl text-6xl font-black leading-[0.85] tracking-tighter text-white sm:text-8xl lg:text-9xl italic uppercase">
            Party<span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">verse</span>
          </h1>
          <p className="mt-8 max-w-xl text-xl font-medium leading-relaxed text-zinc-400">
            The elite multiplayer platform for instant chaos. Zero accounts, zero latency, just pure social energy across all your devices.
          </p>
          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Game Modes" value="11" icon={<Zap size={14} />} />
            <MetricCard label="Network" value="60Hz" icon={<Globe size={14} />} />
            <MetricCard label="Latency" value="12ms" icon={<Activity size={14} />} />
            <MetricCard label="Tech" value="PWA" icon={<Fingerprint size={14} />} />
          </div>
        </motion.div>
        
        <RoomLauncher />
      </section>

      <motion.section 
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6"
      >
        <InstallPrompt />
      </motion.section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="The Catalog" title="Select Your Weapon">
          Engineered for high-stakes competition and creative disaster. Switch modes instantly without leaving the room.
        </SectionHeader>
        <div className="mt-12">
          <GameGrid />
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <FeaturePanel 
          icon={<Crown size={28} className="text-amber-400" />}
          title="Prestige Progression"
          description="Scale from Bronze to Grandmaster. Unlock rare titles and animated nickname flairs as you dominate."
        />
        <FeaturePanel 
          icon={<Users size={28} className="text-cyan-400" />}
          title="Social Persistence"
          description="Add rivals, build your squad, and save legendary match moments to your permanent gallery."
        />
        <FeaturePanel 
          icon={<ShieldCheck size={28} className="text-emerald-400" />}
          title="Secure Isolation"
          description="Encrypted room codes and instant rate-limiting ensure your party stays private and protected."
        />
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_480px] mb-24">
        <Panel className="p-8 border-l-4 border-cyan-500/20 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-8">
            <Activity size={18} /> Global Hall of Fame
          </div>
          <div className="grid gap-4">
            {leaderboardEntries.slice(0, 5).map((entry, index) => (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                key={entry.name} 
                className="grid grid-cols-[auto_1fr_auto] items-center gap-5 rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.06] transition-all group"
              >
                <div className={`grid size-12 place-items-center rounded-xl font-black text-lg transition-all ${index === 0 ? "bg-amber-400 text-zinc-950 scale-110 shadow-lg shadow-amber-500/20" : "bg-white/10 text-white group-hover:bg-white/20"}`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-black text-lg italic uppercase tracking-tight">{entry.name}</div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{entry.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{entry.xp.toLocaleString()} XP</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">{entry.wins} WINS</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
        
        <Panel className="p-8 border-l-4 border-fuchsia-500/20 bg-gradient-to-br from-white/[0.03] to-transparent">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-fuchsia-400 mb-8">Legendary Snapshots</div>
          <div className="grid gap-4 sm:grid-cols-2 h-full content-start">
            {galleryMoments.map((moment, index) => (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                key={moment.title} 
                className={`group relative min-h-[160px] rounded-2xl bg-gradient-to-br ${moment.color} p-5 text-zinc-950 shadow-xl transition-all hover:-translate-y-1 active:scale-95 cursor-pointer`}
              >
                <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">{moment.game}</div>
                <div className="mt-8 text-xl font-black italic uppercase leading-none">{moment.title}</div>
                <div className="mt-2 text-xs font-bold opacity-80">{moment.stat}</div>
                <div className="absolute bottom-4 right-4 size-8 grid place-items-center rounded-lg bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 shadow-xl">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {icon} {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white italic tracking-tighter uppercase">{value}</div>
    </div>
  );
}

function FeaturePanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Panel className="p-8 hover:bg-white/[0.04] transition-all group border-b-4 border-white/5">
      <div className="grid size-16 place-items-center rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="mt-8 text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">{description}</p>
    </Panel>
  );
}
