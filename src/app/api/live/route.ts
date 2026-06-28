import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getLiveStreamFeed } from "@/lib/live-streams";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const liveStreams = await getLiveStreamFeed();

  return NextResponse.json({ liveStreams });
}
