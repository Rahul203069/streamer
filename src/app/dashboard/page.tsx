import { Radio, Upload } from "lucide-react";
import Link from "next/link";

import { DashboardLiveStreams } from "@/components/dashboard-live-streams";
import { DashboardVideos } from "@/components/dashboard-videos";
import { DeleteAllVideosCard } from "@/components/delete-all-videos-card";
import { DisableAllLiveStreamsCard } from "@/components/disable-all-live-streams-card";
import { PageShell } from "@/components/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireAuth();
  const isAdmin = isAdminSession(session);
  const [videos, liveStreams] = await Promise.all([
    prisma.video.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.liveStream.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const initials =
    session.user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <PageShell className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage uploaded videos and live inputs.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/upload" className={cn(buttonVariants())}>
            <Upload className="size-4" />
            Upload Video
          </Link>
          <Link href="/live/create" className={cn(buttonVariants({ variant: "outline" }))}>
            <Radio className="size-4" />
            Create Live
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
          <CardDescription>Signed in with Google.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium">{session.user.name ?? "Google user"}</p>
            <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <DisableAllLiveStreamsCard />
          <DeleteAllVideosCard />
        </div>
      ) : null}

      <Separator />
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardVideos videos={videos} />
        <DashboardLiveStreams liveStreams={liveStreams} />
      </div>
    </PageShell>
  );
}
