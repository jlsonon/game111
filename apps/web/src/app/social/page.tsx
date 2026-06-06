import { Panel, SectionHeader } from "@/components/ui";
import { Check, Search, UserPlus, X } from "lucide-react";

const friends = ["Mika", "Jolo", "Sam", "Ari", "Luna"];

export default function SocialPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Social" title="Friends and Invites">
        Friend requests, accept/reject flows, search, invites, match history, hall of fame, and private friend leaderboards.
      </SectionHeader>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <label className="flex min-h-12 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3">
            <Search size={18} className="text-zinc-400" />
            <input className="w-full bg-transparent text-white outline-none" placeholder="Search username or invite code" />
          </label>
          <div className="mt-5 grid gap-3">
            {friends.map((friend) => (
              <div key={friend} className="flex items-center justify-between rounded-lg bg-white/8 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-cyan-300 font-black text-zinc-950">{friend[0]}</div>
                  <div>
                    <div className="font-bold">{friend}</div>
                    <div className="text-xs text-zinc-400">Online - ready to invite</div>
                  </div>
                </div>
                <UserPlus size={18} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-xl font-black">Requests</h3>
          {["Kai", "Bea", "Nico"].map((name) => (
            <div key={name} className="mt-3 flex items-center justify-between rounded-lg bg-white/8 p-3">
              <span className="font-bold">{name}</span>
              <span className="flex gap-2"><Check size={18} className="text-emerald-300" /><X size={18} className="text-rose-300" /></span>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}
