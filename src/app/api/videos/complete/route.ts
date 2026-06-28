import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  videoUid: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = schema.parse(await request.json());

    const video = await prisma.video.findFirst({
      where: {
        cloudflareUid: body.videoUid,
        userId: session.user.id,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    await prisma.video.update({
      where: {
        id: video.id,
      },
      data: {
        status: "processing",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not complete upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
