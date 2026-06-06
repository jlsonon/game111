export function QrCard({ code }: { code: string }) {
  const cells = Array.from({ length: 49 }, (_, index) => {
    const char = code.charCodeAt(index % Math.max(1, code.length)) || 7;
    return (char + index * 11) % 3 !== 0;
  });

  return (
    <div className="rounded-lg bg-white p-3 text-zinc-950">
      <div className="grid size-32 grid-cols-7 gap-1">
        {cells.map((active, index) => (
          <span key={index} className={active ? "rounded-sm bg-zinc-950" : "rounded-sm bg-zinc-100"} />
        ))}
      </div>
      <div className="mt-2 text-center text-xs font-black tracking-[0.4em]">{code}</div>
    </div>
  );
}
