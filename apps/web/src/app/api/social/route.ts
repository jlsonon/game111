import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    friends: [
      { id: "mika", username: "Mika", status: "ONLINE" },
      { id: "jolo", username: "Jolo", status: "ONLINE" },
      { id: "sam", username: "Sam", status: "IN_GAME" },
    ],
    requests: [
      { id: "kai", username: "Kai", direction: "INBOUND" },
      { id: "bea", username: "Bea", direction: "INBOUND" },
    ],
    friendLeaderboardEnabled: true,
  });
}
