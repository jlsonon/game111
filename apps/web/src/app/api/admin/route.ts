import { achievements, games } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    users: { total: 1284000, activeToday: 188230 },
    rooms: { live: 1284, locked: 220, playing: 940 },
    content: { games: games.length, achievements: achievements.length, triviaQuestions: 42000 },
    moderation: { openReports: 18, reviewing: 7 },
    analytics: { socketUptime: 0.9998, p95JoinLatencyMs: 82, p95StrokeLatencyMs: 36 },
  });
}
