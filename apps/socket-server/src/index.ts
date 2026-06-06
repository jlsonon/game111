import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
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

app.get("/health", (_request, response) => {
  response.json({ ok: true, rooms: rooms.size });
});

io.on("connection", (socket) => {
  socket.on("create_room", ({ userId, username, gameType }) => {
    const code = uniqueCode();
    const room = createRoom(code, userId, username, gameType ?? "DRAW_GUESS");
    rooms.set(code, room);
    socket.join(code);
    socket.emit("room_created", code);
    io.to(code).emit("room_state_update", room);
  });

  socket.on("join_room", ({ code, userId, username }) => {
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
    room.chat.push(systemMessage("Game is starting!"));
    
    startNextPhase(roomCode);
  });

  socket.on("draw_stroke", ({ code, stroke }) => {
    mutateRoom(code, (room) => {
      room.strokes.push(stroke);
    });
  });

  socket.on("undo_stroke", ({ code, userId }) => {
    mutateRoom(code, (room) => {
      const index = room.strokes.map((s) => s.userId).lastIndexOf(userId);
      if (index >= 0) room.strokes.splice(index, 1);
    });
  });

  socket.on("send_guess", ({ code, userId, username, message }) => {
    mutateRoom(code, (room) => {
      const kind = message.toLowerCase().trim() === room.answer?.toLowerCase() ? "SYSTEM" : "GUESS";
      room.chat.push({ id: cryptoId(), userId, username, message: message.slice(0, 240), kind, createdAt: Date.now() });
      
      if (room.answer && message.trim().toLowerCase() === room.answer.toLowerCase() && room.phase === "GUESSING") {
        room.players[userId].score += 100;
        room.chat.push(systemMessage(`${username} guessed correctly!`));
        // If all players guessed, skip to next phase
      }
    });
  });

  socket.on("submit_answer", ({ code, userId, answer }) => {
    mutateRoom(code, (room) => {
      room.submissions[userId] = { answer, timestamp: Date.now() };
      room.chat.push(systemMessage(`${room.players[userId]?.username || "A player"} submitted.`));
      
      // Check if all players submitted
      const activePlayers = Object.values(room.players).filter(p => p.connected && p.isAlive);
      if (Object.keys(room.submissions).length >= activePlayers.length) {
        startNextPhase(code);
      }
    });
  });

  socket.on("cast_vote", ({ code, vote }) => {
    mutateRoom(code, (room) => {
      room.votes = room.votes.filter((v) => v.voterId !== vote.voterId);
      room.votes.push(vote);
      
      const activePlayers = Object.values(room.players).filter(p => p.connected && p.isAlive);
      if (room.votes.length >= activePlayers.length) {
        startNextPhase(code);
      }
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
    // Handle disconnect if needed, maybe mark as disconnected in all rooms
    rooms.forEach((room, code) => {
      Object.values(room.players).forEach(player => {
        // We don't have socket.id to user mapping here easily without more state
      });
    });
  });
});

function mutateRoom(code: string, mutator: (room: RoomState) => void) {
  const roomCode = code.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) return;
  mutator(room);
  room.updatedAt = Date.now();
  io.to(roomCode).emit("room_state_update", room);
}

function startNextPhase(code: string) {
  const roomCode = code.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) return;

  // Clear existing interval
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
    if (nextPhase === "WORD_SELECT" || nextPhase === "SUBMITTING" || nextPhase === "DAY") {
      room.submissions = {};
      room.votes = [];
      room.strokes = [];
      
      // Game-specific initializations
      if (room.gameType === "SECRET_SPY" && room.phase === "DAY") {
        setupSpyGame(room);
      }
      if (room.gameType === "MAFIA" && room.phase === "NIGHT") {
        setupMafiaGame(room);
      }
      if (room.gameType === "IMPOSTOR" && room.phase === "DAY") {
        setupImpostorGame(room);
      }
    }

    // Start timer
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

function setupSpyGame(room: RoomState) {
  const locations = ["Airport", "Hospital", "Cinema", "Beach", "Space Station", "School"];
  const location = locations[Math.floor(Math.random() * locations.length)];
  room.location = location;
  
  const players = Object.values(room.players);
  const spyIndex = Math.floor(Math.random() * players.length);
  players.forEach((p, i) => {
    p.role = i === spyIndex ? "SPY" : "CITIZEN";
  });
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
  const topics = ["Pizza", "Super Mario", "iPhone", "Eiffel Tower", "Coffee", "Minecraft", "Netflix", "TikTok"];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  room.answer = topic;
  
  const players = Object.values(room.players);
  const impostorIndex = Math.floor(Math.random() * players.length);
  players.forEach((p, i) => {
    p.role = i === impostorIndex ? "IMPOSTOR" : "CITIZEN";
  });
}

function getNextPhase(room: RoomState): RoomPhase {
  const { gameType, phase } = room;
  
  if (gameType === "DRAW_GUESS" || gameType === "TELEPHONE_DRAWING") {
    if (phase === "LOBBY") return "WORD_SELECT";
    if (phase === "WORD_SELECT") return "DRAWING";
    if (phase === "DRAWING") return "GUESSING";
    if (phase === "GUESSING") return "REVEAL";
    if (phase === "REVEAL") {
      if (room.round < room.settings.rounds) {
        room.round++;
        return "WORD_SELECT";
      }
      return "COMPLETE";
    }
  }

  if (gameType === "BLUFF_MASTER" || gameType === "MEME_BATTLE" || gameType === "TRIVIA_SHOWDOWN" || gameType === "MOST_LIKELY_TO" || gameType === "WOULD_YOU_RATHER" || gameType === "FASTEST_FINGER") {
    if (phase === "LOBBY") return "SUBMITTING";
    if (phase === "SUBMITTING") return "VOTING";
    if (phase === "VOTING") return "REVEAL";
    if (phase === "REVEAL") {
       if (room.round < room.settings.rounds) {
        room.round++;
        return "SUBMITTING";
      }
      return "COMPLETE";
    }
  }

  if (gameType === "SECRET_SPY") {
    if (phase === "LOBBY") return "DAY";
    if (phase === "DAY") return "VOTING";
    if (phase === "VOTING") return "SPY_GUESS";
    if (phase === "SPY_GUESS") return "REVEAL";
    if (phase === "REVEAL") return "COMPLETE";
  }

  if (gameType === "IMPOSTOR") {
    if (phase === "LOBBY") return "DAY";
    if (phase === "DAY") return "VOTING";
    if (phase === "VOTING") return "REVEAL";
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
       if (mafiaAlive && citizensAlive > 1 && room.round < 10) {
         room.round++;
         return "NIGHT";
       }
       return "COMPLETE";
    }
  }

  // Fallback
  return "COMPLETE";
}

function getPhaseDuration(gameType: GameType | null, phase: RoomPhase): number {
  switch (phase) {
    case "WORD_SELECT": return 10;
    case "DRAWING": return 60;
    case "GUESSING": return 30;
    case "SUBMITTING": return 45;
    case "VOTING": return 20;
    case "REVEAL": return 10;
    default: return 30;
  }
}

function createRoom(code: string, userId: string, username: string, gameType: GameType): RoomState {
  return {
    code,
    status: "WAITING",
    phase: "LOBBY",
    gameType,
    hostId: userId,
    round: 1,
    timer: 0,
    prompt: promptFor(gameType),
    players: {
      [userId]: {
        id: userId,
        username,
        score: 0,
        coins: 0,
        xp: 0,
        level: 1,
        equippedTitle: "Host",
        isReady: false,
        isHost: true,
        connected: true,
        isAlive: true,
      },
    },
    chat: [systemMessage("Room created.")],
    strokes: [],
    votes: [],
    submissions: {},
    settings: {
      rounds: 5,
      timerSeconds: 90,
      maxPlayers: 12,
      isLocked: false,
      allowSpectators: true,
    },
    updatedAt: Date.now(),
  };
}

function uniqueCode() {
  let code = "";
  do {
    code = Math.random().toString(36).slice(2, 6).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function cryptoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function systemMessage(message: string) {
  return { id: cryptoId(), userId: "system", username: "PARTYVERSE", message, kind: "SYSTEM" as const, createdAt: Date.now() };
}

function promptFor(gameType: GameType) {
  const prompts: Record<GameType, string> = {
    DRAW_GUESS: "Jeepney on Mars",
    BLUFF_MASTER: "The first vending machine dispensed what?",
    MEME_BATTLE: "When the squad says one more game",
    TRIVIA_SHOWDOWN: "Which Philippine hero wrote Noli Me Tangere?",
    SECRET_SPY: "Ask careful questions. One player does not know the location.",
    MAFIA: "Night falls. Roles choose actions secretly.",
    TELEPHONE_DRAWING: "A dragon eating halo-halo",
    MOST_LIKELY_TO: "Most likely to overthink a simple prompt?",
    WOULD_YOU_RATHER: "Always know the trivia answer or always draw perfectly?",
    FASTEST_FINGER: "Buzz first when the answer appears.",
    IMPOSTOR: "Describe the word carefully without revealing it to the impostor.",
  };

  return prompts[gameType];
}

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`);
});
