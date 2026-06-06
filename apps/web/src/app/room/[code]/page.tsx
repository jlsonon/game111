"use client";

import { GhostButton, Panel, Metric } from "@/components/ui";
import { games } from "@/lib/catalog";
import { getSocket } from "@/lib/socket";
import { usePartyverseStore } from "@/store/partyverse-store";
import type { GameType, RoomState } from "@partyverse/shared";
import { Crown, Lock, MessageSquare, Play, Send, Users, Volume2, VolumeX } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sensory } from "@/lib/sensory";

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const game = useMemo(() => games.find((item) => item.type === (room?.gameType ?? selectedGame)), [room?.gameType, selectedGame]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.emit("join_room", { code, userId: profile.id, username: profile.username });

    const onUpdate = (state: RoomState) => {
      // Trigger sensory feedback on phase change
      if (room && room.phase !== state.phase) {
        sensory.playSfx("NOTIFICATION");
        sensory.vibrate(20);
        if (state.phase === "RESULT") sensory.celebrate();
      }
      
      setRoom(state);
      if (state.gameType) setSelectedGame(state.gameType);
    };

    socket.on("room_state_update", onUpdate);

    return () => {
      socket.off("room_state_update", onUpdate);
      socket.emit("leave_room", { code, userId: profile.id });
    };
  }, [code, profile.id, profile.username, setRoom, setSelectedGame, room]);

  if (!room) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="size-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto shadow-lg shadow-cyan-500/20"></div>
        <p className="mt-6 font-black text-white text-xl tracking-tight">Connecting to {code}...</p>
      </motion.div>
    </div>
  );

  const players = Object.values(room.players);
  const isHost = room.hostId === profile.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Header */}
          <Panel className="p-4 border-b-4 border-white/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                  <Users size={14} /> Room {code}
                </div>
                <h1 className="mt-1 text-4xl font-black italic tracking-tighter text-white uppercase">{game?.name ?? "Party Room"}</h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <GhostButton 
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    sensory.setAudioEnabled(next);
                  }}
                  className="size-11 rounded-xl p-0"
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-zinc-500" />}
                </GhostButton>

                {isHost && room.phase === "LOBBY" && (
                  <select
                    value={room.gameType ?? selectedGame}
                    onChange={(e) => {
                      const nextGame = e.target.value as GameType;
                      getSocket().emit("set_game", { code, userId: profile.id, gameType: nextGame });
                      setSelectedGame(nextGame);
                      sensory.playSfx("POP");
                    }}
                    className="min-h-11 rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm font-black text-white transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none hover:bg-zinc-900"
                  >
                    {games.map((item) => <option key={item.type} value={item.type}>{item.name}</option>)}
                  </select>
                )}
                
                <div className={`grid place-items-center rounded-xl bg-white/5 px-4 h-11 font-mono text-xl font-black transition-colors ${room.timer <= 10 ? "text-rose-500 animate-pulse" : "text-cyan-300"}`}>
                  {room.timer}s
                </div>
              </div>
            </div>
          </Panel>

          {/* Main Game Area with Transitions */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${room.phase}-${room.gameType}`}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                {renderGameView(room, profile.id)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Panel className="p-5 border-l-4 border-cyan-500/20">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
              <Users size={16} className="text-cyan-400" />
              Players ({players.length})
            </h2>
            <div className="mt-5 space-y-2">
              {players.map((player) => (
                <motion.div 
                  layout
                  key={player.id} 
                  className={`group relative flex items-center justify-between rounded-xl p-3 transition-all ${player.id === profile.id ? "bg-cyan-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5" : "bg-white/5 hover:bg-white/8"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-9 place-items-center rounded-lg font-black text-sm ${player.id === profile.id ? "bg-cyan-400 text-zinc-950" : "bg-zinc-800 text-white"}`}>
                      {player.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-black italic uppercase">
                        {player.username}
                        {player.isHost && <Crown size={12} className="text-amber-400" />}
                      </div>
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">{player.equippedTitle || "Rookie"}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-black text-cyan-400 font-mono">
                    {player.score.toLocaleString()}
                  </div>
                  {!player.connected && <div className="absolute inset-0 rounded-xl bg-zinc-950/80 backdrop-blur-[2px] flex items-center justify-center text-[10px] font-black uppercase text-rose-500 tracking-widest">Offline</div>}
                </motion.div>
              ))}
            </div>
          </Panel>

          <Panel className="flex h-[450px] flex-col p-5 border-l-4 border-fuchsia-500/20">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2">
              <MessageSquare size={16} className="text-fuchsia-400" />
              Party Stream
            </h2>
            <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {room.chat.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className={`rounded-xl p-3 text-xs leading-relaxed ${msg.kind === "SYSTEM" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 font-bold italic" : "bg-white/5 text-zinc-200"}`}
                >
                  {msg.kind !== "SYSTEM" && <span className="mr-1.5 font-black text-white uppercase italic">{msg.username}:</span>}
                  {msg.message}
                </motion.div>
              ))}
            </div>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!guess.trim()) return;
                getSocket().emit("send_guess", { code, userId: profile.id, username: profile.username, message: guess });
                setGuess("");
                sensory.playSfx("TICK");
              }}
            >
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your move..."
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-bold text-white outline-none transition-all focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
              />
              <button type="submit" className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/20 transition-transform active:scale-90 hover:scale-105">
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
