import { leaderboardEntries } from "@/lib/catalog";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return NextResponse.json({
    scope: params.get("scope") ?? "global",
    category: params.get("category") ?? "xp",
    period: params.get("period") ?? "weekly",
    entries: leaderboardEntries,
    generatedAt: new Date().toISOString(),
  });
}
