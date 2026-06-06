"use client";

import { Button, Metric, Panel } from "@/components/ui";
import { getSocket } from "@/lib/socket";
import type { RoomState } from "@partyverse/shared";
import { Play, QrCode, Settings, UserCheck } from "lucide-react";
import { QrCard } from "@/components/qr-card";

export function Lobby({ room, userId }: { room: RoomState; userId: string }) {
  const isHost = room.hostId === userId;
  const players = Object.values(room.players);
  const readyCount = players.filter(p => p.isReady).length;

  return (
    <div className="grid h-full gap-6 content-start">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Panel className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
          <QrCard code={room.code} />
          <h3 className="mt-6 text-xl font-black">Invite Friends</h3>
          <p className="mt-2 text-sm text-zinc-400">Scan this code to join the party directly from your phone.</p>
        </Panel>

        <Panel className="p-8 flex flex-col justify-center">
          <div className="space-y-6">
            <Metric label="Game Mode" value={room.gameType || "Not Selected"} />
            <Metric label="Players" value={`${players.length}/${room.settings.maxPlayers}`} detail={`${readyCount} ready`} />
            <Metric label="Rounds" value={room.settings.rounds.toString()} />
          </div>
        </Panel>

        <Panel className="p-8 flex flex-col items-center justify-center text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-white/5 text-cyan-400 mb-6">
            <UserCheck size={32} />
          </div>
          <h3 className="text-xl font-black">Are you ready?</h3>
          <p className="mt-2 text-sm text-zinc-400 mb-8">Waiting for everyone to prepare before we start the chaos.</p>
          <Button 
            onClick={() => getSocket().emit("set_ready", { code: room.code, userId, ready: !room.players[userId]?.isReady })}
            className={`w-full h-14 text-lg ${room.players[userId]?.isReady ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : ""}`}
          >
            {room.players[userId]?.isReady ? "I'm Ready!" : "Mark as Ready"}
          </Button>
        </Panel>
      </div>

      {isHost && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => getSocket().emit("start_game", { code: room.code, userId })}
            className="h-16 px-12 text-xl font-black bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-xl shadow-cyan-500/20 hover:scale-105 transition-transform"
            disabled={players.length < 1} // At least host for testing, but ideally more
          >
            <Play size={24} className="fill-current" />
            Start Party
          </Button>
        </div>
      )}
    </div>
  );
}
