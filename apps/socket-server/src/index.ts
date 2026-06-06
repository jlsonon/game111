import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { z } from "zod";
import type { 
  DrawingStroke, 
  GameType, 
  RoomState, 
  VoteRecord, 
  RoomPhase, 
  Player,
  ClientToServerEvents,
  ServerToClientEvents
} from "@partyverse/shared";

// --- VALIDATION SCHEMAS ---
const JoinRoomSchema = z.object({
  code: z.string().length(4),
  userId: z.string().min(1),
  username: z.string().min(2).max(20),
});

const SubmitAnswerSchema = z.object({
  code: z.string().length(4),
  userId: z.string(),
  answer: z.any(),
});

const CastVoteSchema = z.object({
  code: z.string().length(4),
  vote: z.object({
    id: z.string(),
    voterId: z.string(),
    targetId: z.string(),
    value: z.string().optional(),
    createdAt: z.number(),
  }),
});

// --- SERVER SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.WEB_ORIGIN?.split(",") ?? "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
const rooms = new Map<string, RoomState>();
const intervals = new Map<string, NodeJS.Timeout>();
const socketToUser = new Map<string, { userId: string; code: string }>();

app.get("/health", (_request, response) => {
  response.json({ ok: true, rooms: rooms.size });
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("create_room", ({ userId, username, gameType }) => {
    const code = uniqueCode();
    const room = createRoom(code, userId, username, gameType ?? "DRAW_GUESS");
    rooms.set(code, room);
    socketToUser.set(socket.id, { userId, code });
    socket.join(code);
    socket.emit("room_created", code);
    io.to(code).emit("room_state_update", room);
  });

  socket.on("join_room", (data) => {
    const result = JoinRoomSchema.safeParse(data);
    if (!result.success) return;

    const { code, userId, username } = result.data;
    const roomCode = code.toUpperCase();
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit("partyverse_error", { message: "Room not found" });
      return;
    }

    if (room.settings.isLocked && !room.players[userId]) {
      socket.emit("partyverse_error", { message: "Room is locked" });
      return;
    }

    socketToUser.set(socket.id, { userId, code: roomCode });

    if (!room.players[userId]) {
      room.players[userId] = {
        id: userId,
        username,
        score: 0,
        coins: 0,
        xp: 0,
        level: 1,
        equippedTitle: null,
        isReady: false,
        isHost: room.hostId === userId,
        connected: true,
        isAlive: true,
      };
    } else {
      room.players[userId].connected = true;
      room.players[userId].username = username;
    }
    
    room.updatedAt = Date.now();
    socket.join(roomCode);
    io.to(roomCode).emit("room_state_update", room);
  });

  socket.on("leave_room", ({ code, userId }) => {
    const roomCode = code.toUpperCase();
    const room = rooms.get(roomCode);
    if (!room || !room.players[userId]) return;
    room.players[userId].connected = false;
    room.updatedAt = Date.now();
    socketToUser.delete(socket.id);
    io.to(roomCode).emit("room_state_update", room);
  });

  socket.on("set_ready", ({ code, userId, ready }) => {
    mutateRoom(code, (room) => {
      if (room.players[userId]) room.players[userId].isReady = ready;
    });
  });

  socket.on("set_game", ({ code, userId, gameType }) => {
    mutateRoom(code, (room) => {
      if (room.hostId !== userId) return;
      if (room.status === "PLAYING") return;

      room.gameType = gameType;
      room.phase = "LOBBY";
      room.status = "WAITING";
      room.round = 1;
      room.prompt = promptFor(gameType);
      room.strokes = [];
      room.votes = [];
      room.submissions = {};
      room.results = null;
    });
  });

  socket.on("start_game", ({ code, userId }) => {
    const roomCode = code.toUpperCase();
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== userId) return;

    room.status = "PLAYING";
    room.round = 1;
    room.chat.push(systemMessage("The party is starting! Get ready..."));
    
    Object.values(room.players).forEach(p => {
      p.score = 0;
      p.isAlive = true;
    });

    startNextPhase(roomCode);
  });

  socket.on("draw_stroke", ({ code, stroke }) => {
    mutateRoom(code, (room) => {
      if (room.phase !== "DRAWING") return;
      room.strokes.push(stroke);
    });
  });

  socket.on("undo_stroke", ({ code, userId }) => {
    mutateRoom(code, (room) => {
      if (room.phase !== "DRAWING") return;
      const index = room.strokes.map((s) => s.userId).lastIndexOf(userId);
      if (index >= 0) room.strokes.splice(index, 1);
    });
  });

  socket.on("send_guess", ({ code, userId, username, message }) => {
    mutateRoom(code, (room) => {
      const isCorrect = message.toLowerCase().trim() === room.answer?.toLowerCase();
      const kind = isCorrect ? "SYSTEM" : "GUESS";
      
      if (isCorrect && room.phase === "GUESSING" && !hasGuessedCorrectly(room, userId)) {
        room.players[userId].score += Math.max(50, 150 - room.chat.filter(m => m.kind === "SYSTEM" && m.message.includes("guessed correctly")).length * 20);
        room.chat.push(systemMessage(`${username} guessed correctly!`));
        checkAutoSkip(room, code);
      } else {
        room.chat.push({ id: cryptoId(), userId, username, message: message.slice(0, 240), kind, createdAt: Date.now() });
      }
    });
  });

  socket.on("submit_answer", (data) => {
    const result = SubmitAnswerSchema.safeParse(data);
    if (!result.success) return;

    const { code, userId, answer } = result.data;
    mutateRoom(code, (room) => {
      if (room.phase !== "SUBMITTING" && room.phase !== "DAY" && room.phase !== "NIGHT") return;
      room.submissions[userId] = { answer, timestamp: Date.now() };
      room.chat.push(systemMessage(`${room.players[userId]?.username || "A player"} submitted.`));
      checkAutoSkip(room, code);
    });
  });

  socket.on("cast_vote", (data) => {
    const result = CastVoteSchema.safeParse(data);
    if (!result.success) return;

    const { code, vote } = result.data;
    mutateRoom(code, (room) => {
      if (room.phase !== "VOTING" && room.phase !== "NIGHT" && room.phase !== "SPY_GUESS") return;
      room.votes = room.votes.filter((v) => v.voterId !== vote.voterId);
      room.votes.push(vote);
      checkAutoSkip(room, code);
    });
  });

  socket.on("host_action", ({ code, userId, action, targetId }) => {
    mutateRoom(code, (room) => {
      if (room.hostId !== userId) return;
      if (action === "LOCK") room.settings.isLocked = !room.settings.isLocked;
      if (action === "MUTE" && targetId && room.players[targetId]) room.players[targetId].isMuted = !room.players[targetId].isMuted;
      if (action === "KICK" && targetId && targetId !== room.hostId) delete room.players[targetId];
    });
  });

  socket.on("disconnect", () => {
    const info = socketToUser.get(socket.id);
    if (!info) return;

    const { userId, code } = info;
    const room = rooms.get(code);
    if (!room || !room.players[userId]) return;

    room.players[userId].connected = false;
    room.updatedAt = Date.now();

    // Host Migration
    if (room.hostId === userId) {
      const nextHost = Object.values(room.players).find(p => p.connected && p.id !== userId);
      if (nextHost) {
        room.hostId = nextHost.id;
        room.players[nextHost.id].isHost = true;
        room.chat.push(systemMessage(`${nextHost.username} is now the host.`));
      }
    }

    io.to(code).emit("room_state_update", room);
    socketToUser.delete(socket.id);
  });
});

// --- ROOM LOGIC HELPERS ---

function mutateRoom(code: string, mutator: (room: RoomState) => void) {
  const roomCode = code.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) return;
  mutator(room);
  room.updatedAt = Date.now();
  io.to(roomCode).emit("room_state_update", room);
}

function hasGuessedCorrectly(room: RoomState, userId: string): boolean {
  return room.chat.some(m => m.userId === userId && m.kind === "SYSTEM" && m.message.includes("guessed correctly"));
}

function checkAutoSkip(room: RoomState, code: string) {
  const activePlayers = Object.values(room.players).filter(p => p.connected && p.isAlive);
  
  if (room.phase === "GUESSING") {
    const guessCount = Object.values(room.players).filter(p => p.id !== room.activePlayerId && hasGuessedCorrectly(room, p.id)).length;
    if (guessCount >= activePlayers.length - 1) startNextPhase(code);
  } else if (room.phase === "SUBMITTING") {
    if (Object.keys(room.submissions).length >= activePlayers.length) startNextPhase(code);
  } else if (room.phase === "VOTING") {
    if (room.votes.length >= activePlayers.length) startNextPhase(code);
  }
}

function startNextPhase(code: string) {
  const roomCode = code.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) return;

  if (intervals.has(roomCode)) {
    clearInterval(intervals.get(roomCode));
    intervals.delete(roomCode);
  }

  const nextPhase = getNextPhase(room);
  
  if (nextPhase === "COMPLETE") {
    room.status = "FINISHED";
    room.phase = "RESULT";
    room.timer = 0;
  } else {
    room.phase = nextPhase;
    room.timer = getPhaseDuration(room.gameType, nextPhase);
    room.updatedAt = Date.now();
    
    // Phase-specific setup
    if (nextPhase === "WORD_SELECT" || nextPhase === "SUBMITTING" || nextPhase === "DAY" || nextPhase === "NIGHT") {
      room.submissions = {};
      room.votes = [];
      room.strokes = [];
      
      if (room.gameType === "DRAW_GUESS" && nextPhase === "WORD_SELECT") {
        setupDrawGuessTurn(room);
      }
      if (room.gameType === "SECRET_SPY" && nextPhase === "DAY") {
        setupSpyGame(room);
      }
      if (room.gameType === "MAFIA" && nextPhase === "NIGHT") {
        setupMafiaGame(room);
      }
      if (room.gameType === "IMPOSTOR" && nextPhase === "DAY") {
        setupImpostorGame(room);
      }
    }

    const interval = setInterval(() => {
      const currentRoom = rooms.get(roomCode);
      if (!currentRoom) {
        clearInterval(interval);
        return;
      }

      if (currentRoom.timer > 0) {
        currentRoom.timer--;
        io.to(roomCode).emit("room_state_update", currentRoom);
      } else {
        clearInterval(interval);
        startNextPhase(roomCode);
      }
    }, 1000);
    intervals.set(roomCode, interval);
  }

  io.to(roomCode).emit("room_state_update", room);
}

function setupDrawGuessTurn(room: RoomState) {
  const players = Object.values(room.players).filter(p => p.connected);
  const nextDrawer = players[Math.floor(Math.random() * players.length)];
  room.activePlayerId = nextDrawer.id;
  room.prompt = ["Super Mario", "Espresso", "Volcano", "Cyberpunk", "Dinosaur"][Math.floor(Math.random() * 5)];
  room.answer = room.prompt;
}

function setupSpyGame(room: RoomState) {
  const locations = ["Airport", "Hospital", "Cinema", "Beach", "Space Station", "School", "Casino", "Submarine"];
  room.location = locations[Math.floor(Math.random() * locations.length)];
  const players = Object.values(room.players);
  const spyIndex = Math.floor(Math.random() * players.length);
  players.forEach((p, i) => { p.role = i === spyIndex ? "SPY" : "CITIZEN"; });
}

function setupMafiaGame(room: RoomState) {
  const players = Object.values(room.players);
  const roles = ["MAFIA", "DOCTOR", "DETECTIVE"];
  players.forEach((p, i) => {
    p.role = roles[i] || "CITIZEN";
    p.isAlive = true;
  });
}

function setupImpostorGame(room: RoomState) {
  const topics = ["Pizza", "iPhone", "Netflix", "TikTok", "Bitcoin", "Star Wars", "Eiffel Tower"];
  room.answer = topics[Math.floor(Math.random() * topics.length)];
  const players = Object.values(room.players);
  const impostorIndex = Math.floor(Math.random() * players.length);
  players.forEach((p, i) => { p.role = i === impostorIndex ? "IMPOSTOR" : "CITIZEN"; });
}

function getNextPhase(room: RoomState): RoomPhase {
  const { gameType, phase } = room;
  
  if (gameType === "DRAW_GUESS") {
    if (phase === "LOBBY") return "WORD_SELECT";
    if (phase === "WORD_SELECT") return "DRAWING";
    if (phase === "DRAWING") return "GUESSING";
    if (phase === "GUESSING") return "REVEAL";
    if (phase === "REVEAL") return room.round < room.settings.rounds ? (room.round++, "WORD_SELECT") : "COMPLETE";
  }

  if (["BLUFF_MASTER", "MEME_BATTLE", "TRIVIA_SHOWDOWN", "MOST_LIKELY_TO", "WOULD_YOU_RATHER", "FASTEST_FINGER"].includes(gameType || "")) {
    if (phase === "LOBBY") return "SUBMITTING";
    if (phase === "SUBMITTING") return "VOTING";
    if (phase === "VOTING") return "REVEAL";
    if (phase === "REVEAL") return room.round < room.settings.rounds ? (room.round++, "SUBMITTING") : "COMPLETE";
  }

  if (gameType === "SECRET_SPY" || gameType === "IMPOSTOR") {
    if (phase === "LOBBY") return "DAY";
    if (phase === "DAY") return "VOTING";
    if (phase === "VOTING") return gameType === "SECRET_SPY" ? "SPY_GUESS" : "REVEAL";
    if (phase === "SPY_GUESS") return "REVEAL";
    if (phase === "REVEAL") return "COMPLETE";
  }

  if (gameType === "MAFIA") {
    if (phase === "LOBBY") return "NIGHT";
    if (phase === "NIGHT") return "DAY";
    if (phase === "DAY") return "VOTING";
    if (phase === "VOTING") return "REVEAL";
    if (phase === "REVEAL") {
       const mafiaAlive = Object.values(room.players).some(p => p.role === "MAFIA" && p.isAlive);
       const citizensAlive = Object.values(room.players).filter(p => p.role !== "MAFIA" && p.isAlive).length;
       return (mafiaAlive && citizensAlive > 1) ? (room.round++, "NIGHT") : "COMPLETE";
    }
  }

  return "COMPLETE";
}

function getPhaseDuration(gameType: GameType | null, phase: RoomPhase): number {
  switch (phase) {
    case "WORD_SELECT": return 8;
    case "DRAWING": return 60;
    case "GUESSING": return 45;
    case "SUBMITTING": return 40;
    case "VOTING": return 25;
    case "REVEAL": return 12;
    case "DAY": return 120;
    case "NIGHT": return 30;
    default: return 30;
  }
}

function createRoom(code: string, userId: string, username: string, gameType: GameType): RoomState {
  return {
    code, status: "WAITING", phase: "LOBBY", gameType, hostId: userId, round: 1, timer: 0,
    players: {
      [userId]: { id: userId, username, score: 0, coins: 0, xp: 0, level: 1, equippedTitle: "Host", isReady: false, isHost: true, connected: true, isAlive: true }
    },
    chat: [systemMessage("Room created. Ready for some chaos?")], strokes: [], votes: [], submissions: {},
    settings: { rounds: 5, timerSeconds: 90, maxPlayers: 12, isLocked: false, allowSpectators: true },
    updatedAt: Date.now(),
  };
}

function uniqueCode() {
  let code = "";
  do { code = Math.random().toString(36).slice(2, 6).toUpperCase(); } while (rooms.has(code));
  return code;
}

function cryptoId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }

function systemMessage(message: string) {
  return { id: cryptoId(), userId: "system", username: "PARTYVERSE", message, kind: "SYSTEM" as const, createdAt: Date.now() };
}

function promptFor(gameType: GameType) {
  const prompts: Record<GameType, string> = {
    DRAW_GUESS: "Get ready to draw!",
    BLUFF_MASTER: "A group of flamingos is called a what?",
    MEME_BATTLE: "When the host changes the timer to 5 seconds...",
    TRIVIA_SHOWDOWN: "Which planet is known as the Red Planet?",
    SECRET_SPY: "One of you is a spy. Interrogate each other!",
    MAFIA: "Night falls. Mafia, pick your victim.",
    TELEPHONE_DRAWING: "Pass the drawing down the line!",
    MOST_LIKELY_TO: "Most likely to spend all their coins on a nameplate?",
    WOULD_YOU_RATHER: "Fly like a bird OR swim like a fish?",
    FASTEST_FINGER: "React as fast as you can!",
    IMPOSTOR: "One player has a different word. Find them!",
  };
  return prompts[gameType];
}

httpServer.listen(PORT, () => {
  console.log(`🚀 Partyverse Engine running on port ${PORT}`);
});
