import { achievements, games, titles } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    games,
    achievements,
    titles,
    triviaCategories: ["General Knowledge", "Movies", "Anime", "Gaming", "Science", "History", "Philippines"],
    economy: {
      coinSinks: ["Avatars", "Themes", "Frames", "Name effects", "Chat cosmetics", "Room decorations"],
      rewardSources: ["Playing", "Winning", "Voting", "Participation", "Daily rewards", "Streaks"],
    },
  });
}
