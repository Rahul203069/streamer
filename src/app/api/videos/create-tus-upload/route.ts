import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getCloudflareCredentials } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().trim().min(1).max(160),
  fileSize: z.number().int().positive(),
});

function encodeMetadataValue(value: string) {
  return Buffer.from(value).toString("base64");
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const { accountId, token } = getCloudflareCredentials();
    const uploadMetadata = `name ${encodeMetadataValue(body.title)}`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Tus-Resumable": "1.0.0",
          "Upload-Length": String(body.fileSize),
          "Upload-Metadata": uploadMetadata,
        },
      },
    );

    const uploadURL = response.headers.get("Location");
    const streamMediaId = response.headers.get("stream-media-id");

    if (!response.ok || !uploadURL || !streamMediaId) {
      throw new Error("Could not create Cloudflare tus upload.");
    }

    await prisma.video.create({
      data: {
        title: body.title,
        cloudflareUid: streamMediaId,
        status: "uploading",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      uploadURL,
      videoUid: streamMediaId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create tus upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
