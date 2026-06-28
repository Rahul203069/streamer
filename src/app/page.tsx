import { Play, Radio, Upload, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LiveVideosSection } from "@/components/live-videos-section";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getLiveStreamFeed } from "@/lib/live-streams";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [videos, liveStreams] = await Promise.all([
    prisma.video.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getLiveStreamFeed(),
  ]);

  return (
    <PageShell className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
          <p className="mt-2 text-muted-foreground">Watch uploads and live streams from creators.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/upload" className={cn(buttonVariants())}>
            <Upload className="size-4" />
            Upload
          </Link>
          <Link href="/live/create" className={cn(buttonVariants({ variant: "outline" }))}>
            <Radio className="size-4" />
            Go Live
          </Link>
        </div>
      </section>

      <LiveVideosSection initialLiveStreams={liveStreams} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Watch Videos</h2>
            <p className="text-sm text-muted-foreground">
              Uploaded videos from all users appear here.
            </p>
          </div>
          <Link href="/upload" className={cn(buttonVariants({ size: "sm" }))}>
            <Upload className="size-4" />
            Upload
          </Link>
        </div>

        {videos.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-lg border bg-muted">
              <Video className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>No videos yet</CardTitle>
            <CardDescription>
              Once users upload videos, they will appear here for everyone who signs in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/upload" className={cn(buttonVariants())}>
              <Upload className="size-4" />
              Upload first video
            </Link>
            <Link href="/live/create" className={cn(buttonVariants({ variant: "outline" }))}>
              <Radio className="size-4" />
              Go live instead
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Link
              key={video.cloudflareUid}
              href={`/watch/${video.cloudflareUid}`}
              className="group block focus-visible:outline-none"
            >
              <div className="aspect-video overflow-hidden rounded-lg border bg-black transition-colors group-hover:border-foreground/40">
                <div className="flex h-full items-center justify-center">
                  <Play className="size-10 fill-white text-white opacity-90 transition-transform group-hover:scale-105" />
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {(video.user.name ?? video.user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="line-clamp-2 text-sm font-medium leading-5 group-hover:underline">
                    {video.title}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">
                    {video.user.name ?? video.user.email ?? "Unknown creator"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[11px]">
                      {video.status}
                    </Badge>
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </section>
    </PageShell>
  );
}
