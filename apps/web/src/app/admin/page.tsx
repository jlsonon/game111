import { Metric, Panel, SectionHeader } from "@/components/ui";

export default function AdminPage() {
  const areas = ["Users", "Rooms", "Achievements", "Questions", "Trivia Database", "Reports", "Analytics"];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader eyebrow="Super Admin" title="Operations Dashboard">
        Production operators can manage content, moderation, rewards, live rooms, reports, and platform telemetry.
      </SectionHeader>
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <Metric label="Live Rooms" value="1,284" />
        <Metric label="Reports" value="18" detail="open" />
        <Metric label="Questions" value="42,000" />
        <Metric label="Events" value="99.98%" detail="socket uptime" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Panel key={area} className="p-5">
            <h3 className="text-xl font-black">{area}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Search, filter, audit, create, update, disable, and export {area.toLowerCase()} records.</p>
          </Panel>
        ))}
      </div>
    </section>
  );
}
