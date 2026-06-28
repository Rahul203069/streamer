import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getCloudflareCredentials } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const uploadLength = request.headers.get("Upload-Length");
    const uploadMetadata = request.headers.get("Upload-Metadata");

    if (!uploadLength || !uploadMetadata) {
      return NextResponse.json({ error: "Missing tus upload headers." }, { status: 400 });
    }

    const metadata = parseTusMetadata(uploadMetadata);
    const body = z
      .object({
        title: z.string().trim().min(1).max(160),
      })
      .parse({
        title: metadata.name ?? metadata.title,
      });
    const { accountId, token } = getCloudflareCredentials();

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Tus-Resumable": "1.0.0",
          "Upload-Length": uploadLength,
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

    return new Response(null, {
      status: 201,
      headers: {
        "Access-Control-Expose-Headers": "Location,stream-media-id",
        Location: uploadURL,
        "stream-media-id": streamMediaId,
        "Tus-Resumable": "1.0.0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create tus upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function parseTusMetadata(uploadMetadata: string) {
  return Object.fromEntries(
    uploadMetadata
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, value] = item.split(" ");

        return [key, value ? Buffer.from(value, "base64").toString("utf8") : ""];
      }),
  );
}
