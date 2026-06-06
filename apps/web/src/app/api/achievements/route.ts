import { achievements } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  const grouped = achievements.reduce<Record<string, number>>((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({ total: achievements.length, grouped, achievements });
}
