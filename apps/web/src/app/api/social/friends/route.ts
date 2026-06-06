import { prisma } from "@partyverse/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const friends = await prisma.friendship.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
      status: "ACCEPTED",
    },
    include: {
      user: { select: { id: true, username: true, rank: true, level: true } },
      friend: { select: { id: true, username: true, rank: true, level: true } },
    },
  });

  return NextResponse.json(friends.map(f => f.userId === userId ? f.friend : f.user));
}

export async function POST(request: Request) {
  const { userId, targetUsername } = await request.json();

  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername },
  });

  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (targetUser.id === userId) return NextResponse.json({ error: "You can't add yourself" }, { status: 400 });

  const friendship = await prisma.friendship.upsert({
    where: {
      userId_friendId: { userId, friendId: targetUser.id },
    },
    update: { status: "ACCEPTED" }, // Instant accept for the "Frictionless" theme
    create: {
      userId,
      friendId: targetUser.id,
      status: "ACCEPTED",
    },
  });

  return NextResponse.json(friendship);
}
