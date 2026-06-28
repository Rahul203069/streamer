import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { createLiveInput } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(1).max(160),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const liveInput = await createLiveInput(body.title);

    await prisma.liveStream.create({
      data: {
        title: body.title,
        cloudflareLiveInputId: liveInput.uid,
        rtmpsUrl: liveInput.rtmps.url,
        streamKey: liveInput.rtmps.streamKey,
        status: "created",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      liveInputId: liveInput.uid,
      rtmpsUrl: liveInput.rtmps.url,
      streamKey: liveInput.rtmps.streamKey,
      watchUrl: `/live/${liveInput.uid}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create live stream.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
