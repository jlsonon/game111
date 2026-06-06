import type { DrawingStroke, GameType, RoomState, VoteRecord } from "@partyverse/shared";

export interface ServerToClientEvents {
  room_created: (code: string) => void;
  room_state_update: (room: RoomState) => void;
  partyverse_error: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  create_room: (payload: { userId: string; username: string; gameType?: GameType }) => void;
  join_room: (payload: { code: string; userId: string; username: string }) => void;
  leave_room: (payload: { code: string; userId: string }) => void;
  set_ready: (payload: { code: string; userId: string; ready: boolean }) => void;
  set_game: (payload: { code: string; userId: string; gameType: GameType }) => void;
  start_game: (payload: { code: string; userId: string }) => void;
  draw_stroke: (payload: { code: string; stroke: DrawingStroke }) => void;
  undo_stroke: (payload: { code: string; userId: string }) => void;
  send_guess: (payload: { code: string; userId: string; username: string; message: string }) => void;
  submit_answer: (payload: { code: string; userId: string; answer: string }) => void;
  cast_vote: (payload: { code: string; vote: VoteRecord }) => void;
  host_action: (payload: { code: string; userId: string; action: "KICK" | "MUTE" | "LOCK"; targetId?: string }) => void;
}
