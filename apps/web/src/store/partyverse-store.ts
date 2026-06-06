"use client";

import type { GameType, RoomState } from "@partyverse/shared";
import { create } from "zustand";

type PlayerProfile = {
  id: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  coins: number;
  level: number;
  title: string;
};

type PartyverseStore = {
  profile: PlayerProfile;
  room: RoomState | null;
  selectedGame: GameType;
  theme: "dark" | "light";
  setProfile: (profile: Partial<PlayerProfile>) => void;
  setRoom: (room: RoomState | null) => void;
  setSelectedGame: (game: GameType) => void;
  toggleTheme: () => void;
};

const defaultId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "local-player";

export const usePartyverseStore = create<PartyverseStore>((set) => ({
  profile: {
    id: defaultId,
    username: "Guest Player",
    xp: 2840,
    coins: 720,
    level: 8,
    title: "Quick Thinker",
  },
  room: null,
  selectedGame: "DRAW_GUESS",
  theme: "dark",
  setProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
  setRoom: (room) => set({ room }),
  setSelectedGame: (selectedGame) => set({ selectedGame }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
