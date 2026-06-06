"use client";

import { Button, Panel, SectionHeader } from "@/components/ui";
import { titles as catalogTitles } from "@/lib/catalog";
import { usePartyverseStore } from "@/store/partyverse-store";
import { Coins, Sparkles, Tag, Palette, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { sensory } from "@/lib/sensory";
import { useState } from "react";

const shopItems = [
  ...catalogTitles.map(t => ({ ...t, kind: "TITLE", price: t.rarity === "Legendary" ? 2500 : t.rarity === "Epic" ? 1200 : 500 })),
  { id: "effect-neon", name: "Neon Glow", kind: "EFFECT", rarity: "Epic", price: 1500, description: "Your nickname glows with a pulsing cyan light." },
  { id: "effect-fire", name: "Flame Trail", kind: "EFFECT", rarity: "Legendary", price: 3000, description: "Leave a trail of fire particles in the chat." },
  { id: "effect-gold", name: "Solid Gold", kind: "EFFECT", rarity: "Rare", price: 800, description: "Your name shines in pure metallic gold." },
];

export default function ShopPage() {
  const { profile, setProfile } = usePartyverseStore();
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  function buyItem(item: typeof shopItems[0]) {
    if (profile.coins < item.price) {
      sensory.playSfx("ERROR");
      sensory.vibrate([50, 50, 50]);
      return;
    }

    sensory.playSfx("SUCCESS");
    sensory.celebrate();
    setProfile({ coins: profile.coins - item.price });
    setPurchasedIds([...purchasedIds, item.id]);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <SectionHeader eyebrow="The Marketplace" title="Prestige Store">
          Unlock exclusive titles, nickname effects, and profile cosmetics to stand out in the arena.
        </SectionHeader>
        <Panel className="flex items-center gap-4 px-6 py-4 border-amber-500/20 bg-amber-500/5 shadow-lg shadow-amber-500/5">
           <div className="grid size-12 place-items-center rounded-xl bg-amber-400 text-zinc-950">
             <Coins size={24} />
           </div>
           <div>
             <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Your Balance</div>
             <div className="text-2xl font-black text-white italic">{profile.coins.toLocaleString()}</div>
           </div>
        </Panel>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shopItems.map((item, index) => {
          const isOwned = purchasedIds.includes(item.id);
          const canAfford = profile.coins >= item.price;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
            >
              <Panel className={`group flex flex-col h-full p-6 transition-all hover:-translate-y-1 ${isOwned ? "border-emerald-500/30 bg-emerald-500/5" : "hover:bg-white/[0.04]"}`}>
                <div className="flex justify-between items-start">
                  <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    item.rarity === "Legendary" ? "bg-amber-500/20 text-amber-400" :
                    item.rarity === "Epic" ? "bg-fuchsia-500/20 text-fuchsia-400" :
                    "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    {item.rarity}
                  </div>
                  {item.kind === "TITLE" ? <Tag size={16} className="text-zinc-500" /> : <Palette size={16} className="text-zinc-500" />}
                </div>

                <h3 className="mt-6 text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-cyan-400 transition-colors">{item.name}</h3>
                <p className="mt-2 text-xs font-medium text-zinc-500 leading-relaxed">
                  {"description" in item ? item.description : `Unlock the exclusive "${item.name}" player title.`}
                </p>

                <div className="mt-auto pt-8">
                  {isOwned ? (
                    <div className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-emerald-500/10 text-emerald-400 font-black uppercase italic text-sm border border-emerald-500/20">
                      <CheckCircle2 size={18} /> Owned
                    </div>
                  ) : (
                    <Button 
                      disabled={!canAfford}
                      onClick={() => buyItem(item)}
                      className={`h-12 w-full font-black uppercase italic tracking-widest text-xs transition-all ${
                        canAfford ? "bg-white text-zinc-950 shadow-xl" : "bg-white/5 text-zinc-600 border-white/5"
                      }`}
                    >
                      {canAfford ? (
                        <div className="flex items-center gap-2">
                           <Coins size={14} /> {item.price.toLocaleString()}
                        </div>
                      ) : "Insufficient Coins"}
                    </Button>
                  )}
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center">
         <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
           <Sparkles size={14} className="text-amber-400" /> More items coming in Season 2
         </div>
      </div>
    </section>
  );
}
