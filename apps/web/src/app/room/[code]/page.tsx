"use client";

import { GhostButton, Panel, Metric } from "@/components/ui";
import { games } from "@/lib/catalog";
import { getSocket } from "@/lib/socket";
import { usePartyverseStore } from "@/store/partyverse-store";
import type { GameType, RoomState } from "@partyverse/shared";
import { Crown, Lock, MessageSquare, Play, Send, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Lobby } from "@/components/games/lobby";
import { DrawGuess } from "@/components/games/draw-guess";
import { GameResult } from "@/components/games/game-result";
import { BluffMaster } from "@/components/games/bluff-master";
import { MemeBattle } from "@/components/games/meme-battle";
import { TriviaShowdown } from "@/components/games/trivia-showdown";
import { SecretSpy } from "@/components/games/secret-spy";
import { Mafia } from "@/components/games/mafia";
import { MostLikelyTo } from "@/components/games/most-likely-to";
import { WouldYouRather } from "@/components/games/would-you-rather";
import { FastestFinger } from "@/components/games/fastest-finger";
import { Impostor } from "@/components/games/impostor";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();
  const { profile, room, setRoom, selectedGame, setSelectedGame } = usePartyverseStore();
  const [guess, setGuess] = useState("");
  
  const game = useMemo(() => games.find((item) => item.type === (room?.gameType ?? selectedGame)), [room?.gameType, selectedGame]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.emit("join_room", { code, userId: profile.id, username: profile.username });

    const onUpdate = (state: RoomState) => {
      setRoom(state);
      if (state.gameType) setSelectedGame(state.gameType);
    };

    socket.on("room_state_update", onUpdate);

    return () => {
      socket.off("room_state_update", onUpdate);
      socket.emit("leave_room", { code, userId: profile.id });
    };
  }, [code, profile.id, profile.username, setRoom, setSelectedGame]);

  if (!room) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 font-bold text-zinc-400 text-lg">Connecting to room {code}...</p>
      </div>
    </div>
  );

  const players = Object.values(room.players);
  const isHost = room.hostId === profile.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Header */}
          <Panel className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-cyan-400">
                  <Users size={16} /> Room {code}
                </div>
                <h1 className="mt-1 text-3xl font-black">{game?.name ?? "Party Room"}</h1>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isHost && room.phase === "LOBBY" && (
                  <select
                    value={room.gameType ?? selectedGame}
                    onChange={(e) => {
                      const nextGame = e.target.value as GameType;
                      getSocket().emit("set_game", { code, userId: profile.id, gameType: nextGame });
                      setSelectedGame(nextGame);
                    }}
                    className="min-h-11 rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm font-bold text-white transition-colors focus:border-cyan-400 focus:outline-none"
                  >
                    {games.map((item) => <option key={item.type} value={item.type}>{item.name}</option>)}
                  </select>
                )}
                <div className="grid place-items-center rounded-xl bg-white/5 px-4 font-mono text-xl font-black text-cyan-300">
                  {room.timer}s
                </div>
              </div>
            </div>
          </Panel>

          {/* Main Game Area */}
          <div className="relative min-h-[500px]">
            {renderGameView(room, profile.id)}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Panel className="p-5">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Users size={20} className="text-cyan-400" />
              Players ({players.length})
            </h2>
            <div className="mt-5 space-y-3">
              {players.map((player) => (
                <div key={player.id} className="group relative flex items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/8">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 text-lg font-black">
                      {player.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        {player.username}
                        {player.isHost && <Crown size={14} className="text-amber-400" />}
                      </div>
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-tight">{player.equippedTitle || "Rookie"}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-black text-cyan-400">
                    {player.score.toLocaleString()}
                  </div>
                  {!player.connected && <div className="absolute inset-0 rounded-xl bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">Disconnected</div>}
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="flex h-[400px] flex-col p-5">
            <h2 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MessageSquare size={20} className="text-fuchsia-400" />
              Party Chat
            </h2>
            <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {room.chat.map((msg) => (
                <div key={msg.id} className={`rounded-xl p-3 text-sm ${msg.kind === "SYSTEM" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100" : "bg-white/5 text-zinc-200"}`}>
                  {msg.kind !== "SYSTEM" && <span className="mr-1.5 font-black text-white">{msg.username}:</span>}
                  {msg.message}
                </div>
              ))}
              {!room.chat.length && <p className="text-center text-sm font-medium text-zinc-500 mt-10">No messages yet.</p>}
            </div>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!guess.trim()) return;
                getSocket().emit("send_guess", { code, userId: profile.id, username: profile.username, message: guess });
                setGuess("");
              }}
            >
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type a message..."
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white outline-none transition-colors focus:border-cyan-400"
              />
              <button type="submit" className="grid size-12 place-items-center rounded-xl bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20 transition-transform active:scale-95">
                <Send size={20} />
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function renderGameView(room: RoomState, userId: string) {
  if (room.phase === "LOBBY") return <Lobby room={room} userId={userId} />;
  if (room.phase === "RESULT") return <GameResult room={room} userId={userId} />;

  switch (room.gameType) {
    case "DRAW_GUESS":
      return <DrawGuess room={room} userId={userId} />;
    case "BLUFF_MASTER":
      return <BluffMaster room={room} userId={userId} />;
    case "MEME_BATTLE":
      return <MemeBattle room={room} userId={userId} />;
    case "TRIVIA_SHOWDOWN":
      return <TriviaShowdown room={room} userId={userId} />;
    case "SECRET_SPY":
      return <SecretSpy room={room} userId={userId} />;
    case "MAFIA":
      return <Mafia room={room} userId={userId} />;
    case "MOST_LIKELY_TO":
      return <MostLikelyTo room={room} userId={userId} />;
    case "WOULD_YOU_RATHER":
      return <WouldYouRather room={room} userId={userId} />;
    case "FASTEST_FINGER":
      return <FastestFinger room={room} userId={userId} />;
    case "IMPOSTOR":
      return <Impostor room={room} userId={userId} />;
    default:
      return (
        <div className="grid min-h-[500px] place-items-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <div>
            <h2 className="text-3xl font-black italic uppercase">Coming Soon</h2>
            <p className="mt-4 text-zinc-400 max-w-md mx-auto font-medium">The {room.gameType?.replace("_", " ")} experience is currently under development. Stay tuned for updates!</p>
          </div>
        </div>
      );
  }
}
