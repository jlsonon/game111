export const GAME_TYPES = [
  "DRAW_GUESS",
  "BLUFF_MASTER",
  "MEME_BATTLE",
  "TRIVIA_SHOWDOWN",
  "SECRET_SPY",
  "MAFIA",
  "TELEPHONE_DRAWING",
  "MOST_LIKELY_TO",
  "WOULD_YOU_RATHER",
  "FASTEST_FINGER",
  "IMPOSTOR",
] as const;

export type GameType = (typeof GAME_TYPES)[number];

export type RoomStatus = "WAITING" | "PLAYING" | "FINISHED";
export type RoomPhase =
  | "LOBBY"
  | "WORD_SELECT"
  | "DRAWING"
  | "GUESSING"
  | "SUBMITTING"
  | "VOTING"
  | "REVEAL"
  | "NIGHT"
  | "DAY"
  | "SPY_GUESS"
  | "RESULT"
  | "COMPLETE";

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string | null;
  score: number;
  coins: number;
  xp: number;
  level: number;
  equippedTitle?: string | null;
  isReady: boolean;
  isHost: boolean;
  isMuted?: boolean;
  connected?: boolean;
  role?: string;
  isAlive?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: number;
  kind: "GUESS" | "CHAT" | "SYSTEM";
}

export interface DrawingStroke {
  id: string;
  userId: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  size: number;
  tool: "BRUSH" | "ERASER";
  createdAt: number;
}

export interface VoteRecord {
  id: string;
  voterId: string;
  targetId: string;
  value?: string;
  createdAt: number;
}

export interface RoomSettings {
  rounds: number;
  timerSeconds: number;
  maxPlayers: number;
  isLocked: boolean;
  allowSpectators: boolean;
}

export interface GameSubmission {
  userId: string;
  answer?: string;
  strokes?: DrawingStroke[];
  vote?: string;
  timestamp: number;
}

export interface RoomState {
  code: string;
  status: RoomStatus;
  phase: RoomPhase;
  gameType: GameType | null;
  hostId: string;
  round: number;
  timer: number;
  prompt?: string | null;
  answer?: string | null;
  activePlayerId?: string | null;
  location?: string | null; // For Secret Spy
  players: Record<string, Player>;
  chat: ChatMessage[];
  strokes: DrawingStroke[];
  votes: VoteRecord[];
  submissions: Record<string, any>;
  settings: RoomSettings;
  results?: any;
  updatedAt: number;
}

export interface GameDefinition {
  type: GameType;
  name: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
  averageMinutes: number;
  primarySkill: string;
  phases: RoomPhase[];
  features: string[];
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: "Drawing" | "Trivia" | "Social" | "Mafia" | "Spy" | "Meme" | "General" | "Bluff" | "Speed";
  tier: "Bronze" | "Silver" | "Gold" | "Epic" | "Legendary";
  xpReward: number;
  coinReward: number;
}

export interface TitleDefinition {
  id: string;
  name: string;
  condition: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export interface RoomSettings {
  rounds: number;
  timerSeconds: number;
  maxPlayers: number;
  isLocked: boolean;
  isPublic: boolean;
  allowSpectators: boolean;
}

export interface ServerToClientEvents {
  room_created: (code: string) => void;
  room_state_update: (state: RoomState) => void;
  public_rooms_update: (rooms: any[]) => void;
  partyverse_error: (error: { message: string }) => void;
  game_start_countdown: (seconds: number) => void;
  peer_signal: (data: { from: string; signal: any }) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { userId: string; username: string; gameType?: GameType; isPublic?: boolean }) => void;
  join_room: (data: { code: string; userId: string; username: string }) => void;
  leave_room: (data: { code: string; userId: string }) => void;
  set_ready: (data: { code: string; userId: string; ready: boolean }) => void;
  set_game: (data: { code: string; userId: string; gameType: GameType }) => void;
  start_game: (data: { code: string; userId: string }) => void;
  draw_stroke: (data: { code: string; stroke: DrawingStroke }) => void;
  undo_stroke: (data: { code: string; userId: string }) => void;
  send_guess: (data: { code: string; userId: string; username: string; message: string }) => void;
  submit_answer: (data: { code: string; userId: string; answer: any }) => void;
  cast_vote: (data: { code: string; vote: VoteRecord }) => void;
  host_action: (data: { code: string; userId: string; action: "KICK" | "MUTE" | "LOCK" | "PUBLIC"; targetId?: string }) => void;
  get_public_rooms: () => void;
  peer_signal: (data: { to: string; from: string; signal: any }) => void;
}

