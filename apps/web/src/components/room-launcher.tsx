"use client";

import { Button, GhostButton, Panel } from "@/components/ui";
import { games } from "@/lib/catalog";
import { getSocket } from "@/lib/socket";
import { roomCode } from "@/lib/utils";
import { usePartyverseStore } from "@/store/partyverse-store";
import { LogIn, Plus, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function RoomLauncher() {
  const router = useRouter();
  const { profile, selectedGame } = usePartyverseStore();
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState(profile.username);
  const selected = useMemo(() => games.find((game) => game.type === selectedGame), [selectedGame]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    const onCreated = (code: string) => router.push(`/room/${code}`);
    socket.on("room_created", onCreated);
    return () => {
      socket.off("room_created", onCreated);
    };
  }, [router]);

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">One room code</div>
          <h2 className="mt-2 text-2xl font-black">Start {selected?.name ?? "a party"}</h2>
        </div>
        <div className="hidden rounded-lg border border-white/10 p-2 sm:block">
          <QrCode size={28} />
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Display name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-cyan-300"
          />
        </label>
        <Button
          onClick={() => {
            const socket = getSocket();
            socket.connect();
            socket.emit("create_room", { userId: profile.id, username: name || profile.username, gameType: selectedGame });
          }}
        >
          <Plus size={18} /> Create Room
        </Button>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={joinCode}
            maxLength={4}
            placeholder={roomCode()}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            className="min-h-12 rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-cyan-300"
          />
          <GhostButton onClick={() => joinCode.length >= 4 && router.push(`/room/${joinCode}`)}>
            <LogIn size={18} /> Join
          </GhostButton>
        </div>
      </div>
    </Panel>
  );
}
