import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { createDirectUploadUrl } from "@/lib/cloudflare";
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
    const upload = await createDirectUploadUrl(body.title);

    await prisma.video.create({
      data: {
        title: body.title,
        cloudflareUid: upload.uid,
        status: "uploading",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      uploadURL: upload.uploadURL,
      videoUid: upload.uid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create upload URL.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
