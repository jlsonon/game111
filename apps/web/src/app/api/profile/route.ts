import { calculateProgression, titles } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  const xp = 18420;

  return NextResponse.json({
    id: "local-profile",
    username: "Guest Player",
    avatarUrl: null,
    joinDate: "2026-06-06",
    xp,
    coins: 4850,
    rank: "Gold",
    title: "Quick Thinker",
    progression: calculateProgression(xp),
    stats: {
      wins: 126,
      losses: 64,
      gamesPlayed: 190,
      accuracy: 0.78,
      streaks: { current: 4, best: 18 },
    },
    unlockedTitles: titles,
  });
}
