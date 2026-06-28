import { NextResponse } from "next/server";

import { isAdminSession } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { deleteStreamVideo } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Only admins can delete all videos." }, { status: 403 });
  }

  const videos = await prisma.video.findMany({
    select: {
      id: true,
      cloudflareUid: true,
    },
  });

  const deletedIds: string[] = [];
  const failures: Array<{ videoUid: string; error: string }> = [];

  for (const video of videos) {
    try {
      await deleteStreamVideo(video.cloudflareUid);
      deletedIds.push(video.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cloudflare request failed.";
      const alreadyGone = message.toLowerCase().includes("not found");

      if (alreadyGone) {
        deletedIds.push(video.id);
      } else {
        failures.push({
          videoUid: video.cloudflareUid,
          error: message,
        });
      }
    }
  }

  if (deletedIds.length > 0) {
    await prisma.video.deleteMany({
      where: {
        id: {
          in: deletedIds,
        },
      },
    });
  }

  return NextResponse.json(
    {
      totalCount: videos.length,
      deletedCount: deletedIds.length,
      failedCount: failures.length,
      failures,
    },
    { status: failures.length > 0 ? 207 : 200 },
  );
}
