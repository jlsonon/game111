import { gameByType } from "@/lib/catalog";
import { roomCode } from "@/lib/utils";
import type { GameType } from "@partyverse/shared";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { hostId?: string; gameType?: GameType };
  const gameType = body.gameType ?? "DRAW_GUESS";

  return NextResponse.json(
    {
      code: roomCode(),
      hostId: body.hostId ?? "anonymous-host",
      gameType,
      game: gameByType[gameType],
      settings: { rounds: 5, timerSeconds: 90, maxPlayers: 12, isLocked: false },
    },
    { status: 201 },
  );
}
