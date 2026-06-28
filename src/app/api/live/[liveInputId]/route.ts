import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { deleteLiveInput } from "@/lib/cloudflare";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ liveInputId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { liveInputId } = await params;
  const liveStream = await prisma.liveStream.findFirst({
    where: {
      cloudflareLiveInputId: liveInputId,
      userId: session.user.id,
    },
  });

  if (!liveStream) {
    return NextResponse.json({ error: "Live stream not found." }, { status: 404 });
  }

  try {
    await deleteLiveInput(liveInputId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const alreadyDeleted = message.toLowerCase().includes("not found");

    if (!alreadyDeleted) {
      return NextResponse.json(
        { error: message || "Could not delete Cloudflare live input." },
        { status: 400 },
      );
    }
  }

  await prisma.liveStream.delete({
    where: {
      id: liveStream.id,
    },
  });

  return NextResponse.json({ ok: true });
}
