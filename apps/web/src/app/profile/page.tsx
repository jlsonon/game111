"use client";

import { Metric, Panel, SectionHeader } from "@/components/ui";
import { achievements as catalogAchievements, calculateProgression, titles as catalogTitles } from "@/lib/catalog";
import { usePartyverseStore } from "@/store/partyverse-store";
import { motion } from "framer-motion";
import { Award, Shield, Target, Trophy, Zap } from "lucide-react";

export default function ProfilePage() {
  const { profile } = usePartyverseStore();
  const progress = calculateProgression(profile.xp);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Intelligence Profile" title={profile.username}>
        Detailed performance metrics, seasonal progression, and prestige status. 
        Your progress is automatically saved to your unique nickname.
      </SectionHeader>

      <div className="mt-12 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Panel className="p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500" />
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="mx-auto grid size-32 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 text-5xl font-black text-white shadow-2xl shadow-cyan-500/20 italic"
            >
              {profile.username.slice(0, 2).toUpperCase()}
            </motion.div>
            
            <h2 className="mt-8 text-3xl font-black italic uppercase tracking-tighter text-white">{profile.username}</h2>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
               <Shield size={12} className="text-cyan-400" /> {profile.title}
            </div>

            <div className="mt-10 space-y-2">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                 <span>Level {progress.level}</span>
                 <span>{Math.round(progress.progress)}%</span>
               </div>
               <div className="h-4 rounded-full bg-white/5 p-1 border border-white/5 shadow-inner">
                 <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                 />
               </div>
               <div className="text-center text-[10px] font-bold text-zinc-600 mt-2 uppercase tracking-tight">
                 {progress.xpForCurrentLevel.toLocaleString()} / {progress.xpForNextLevel.toLocaleString()} XP to Level {progress.level + 1}
               </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" /> Core Achievements
            </h3>
            <div className="grid grid-cols-4 gap-3">
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                 <div key={i} className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${i <= 3 ? "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5" : "bg-white/5 border-white/5 text-zinc-800"}`}>
                   <Award size={20} className={i <= 3 ? "fill-current" : ""} />
                 </div>
               ))}
            </div>
            <p className="mt-6 text-[10px] font-bold text-zinc-500 text-center uppercase tracking-widest">3 / 48 Medals Unlocked</p>
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={<Zap size={16} />} label="Total XP" value={profile.xp.toLocaleString()} detail="Global Rank: #4,120" />
            <MetricCard icon={<Target size={16} />} label="Match Wins" value="126" detail="68% Win Rate" color="text-emerald-400" />
            <MetricCard icon={<Award size={16} />} label="Best Streak" value="18" detail="In Trivia Showdown" color="text-fuchsia-400" />
            <MetricCard icon={<Shield size={16} />} label="Arena Level" value={progress.level.toString()} detail="Elite Tier" color="text-cyan-400" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel className="p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic mb-6">Unlocked Prestige Titles</h3>
              <div className="flex flex-wrap gap-2">
                {catalogTitles.map((title) => (
                  <button 
                    key={title.id} 
                    className={`rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${title.name === profile.title ? "bg-cyan-500 border-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 scale-105" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    {title.name}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic mb-6">Recent Match History</h3>
              <div className="space-y-3">
                 {[
                   { game: "Mafia", result: "Victory", xp: "+240", time: "2h ago", color: "text-emerald-400" },
                   { game: "Draw & Guess", result: "2nd Place", xp: "+180", time: "4h ago", color: "text-white" },
                   { game: "Meme Battle", result: "Defeat", xp: "+45", time: "1d ago", color: "text-rose-500" },
                 ].map((match, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="size-2 rounded-full bg-cyan-500 group-hover:animate-ping" />
                         <div>
                            <div className="text-xs font-black uppercase italic text-white">{match.game}</div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase">{match.time}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`text-xs font-black uppercase italic ${match.color}`}>{match.result}</div>
                         <div className="text-[10px] font-black text-cyan-400">{match.xp} XP</div>
                      </div>
                   </div>
                 ))}
              </div>
            </Panel>
          </div>

          <Panel className="p-8 bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="grid size-20 place-items-center rounded-2xl bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20">
                  <Shield size={40} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Season 1: The Genesis</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-400 max-w-xl">
                    You're a pioneer of the Partyverse. Complete challenges to earn the exclusive "Founding Father" title and holographic nameplate effect before the season ends.
                  </p>
               </div>
               <Button className="h-14 px-8 bg-indigo-500 hover:bg-indigo-600 text-zinc-950 font-black uppercase italic tracking-widest whitespace-nowrap shadow-xl shadow-indigo-500/20">
                 View Battle Pass
               </Button>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, detail, color = "text-white" }: { icon: React.ReactNode, label: string, value: string, detail: string, color?: string }) {
  return (
    <Panel className="p-5 group hover:bg-white/[0.04] transition-all">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 group-hover:text-cyan-400 transition-colors">
        {icon} {label}
      </div>
      <div className={`text-3xl font-black italic uppercase tracking-tighter ${color} mb-1`}>{value}</div>
      <div className="text-[10px] font-bold text-zinc-600 uppercase">{detail}</div>
    </Panel>
  );
}
