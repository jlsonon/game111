import { Panel, SectionHeader } from "@/components/ui";
import { galleryMoments } from "@/lib/catalog";
import { Download, Share2 } from "lucide-react";

export default function GalleryPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Memories" title="Funny Moments Gallery">
        Automatically saved drawings, answers, memes, rare records, victory cards, achievement cards, and share-ready exports.
      </SectionHeader>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {galleryMoments.map((moment) => (
          <Panel key={moment.title} className="overflow-hidden">
            <div className={`h-48 bg-gradient-to-br ${moment.color} p-4 text-zinc-950`}>
              <div className="text-xs font-black uppercase tracking-[0.2em]">{moment.game}</div>
              <div className="mt-20 text-2xl font-black">{moment.title}</div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-zinc-400">{moment.stat}</span>
              <span className="flex gap-2 text-zinc-300"><Share2 size={18} /><Download size={18} /></span>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}
