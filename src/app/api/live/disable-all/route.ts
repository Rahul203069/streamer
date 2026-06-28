import { NextResponse } from "next/server";

import { isAdminSession } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { disableLiveInput } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Only admins can disable live streams." }, { status: 403 });
  }

  const liveStreams = await prisma.liveStream.findMany({
    where: {
      status: {
        notIn: ["disabled", "ended"],
      },
    },
    select: {
      id: true,
      cloudflareLiveInputId: true,
    },
  });

  const disabledIds: string[] = [];
  const failures: Array<{ liveInputId: string; error: string }> = [];

  for (const stream of liveStreams) {
    try {
      await disableLiveInput(stream.cloudflareLiveInputId);
      disabledIds.push(stream.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cloudflare request failed.";
      const alreadyGone = message.toLowerCase().includes("not found");

      if (alreadyGone) {
        disabledIds.push(stream.id);
      } else {
        failures.push({
          liveInputId: stream.cloudflareLiveInputId,
          error: message,
        });
      }
    }
  }

  if (disabledIds.length > 0) {
    await prisma.liveStream.updateMany({
      where: {
        id: {
          in: disabledIds,
        },
      },
      data: {
        status: "disabled",
      },
    });
  }

  return NextResponse.json(
    {
      totalCount: liveStreams.length,
      disabledCount: disabledIds.length,
      failedCount: failures.length,
      failures,
    },
    { status: failures.length > 0 ? 207 : 200 },
  );
}
