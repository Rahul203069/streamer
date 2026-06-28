"use client";

import { Play, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { LiveStreamFeedItem } from "@/lib/live-streams";
import { cn } from "@/lib/utils";

export function LiveVideosSection({
  initialLiveStreams,
  canCreateLive,
}: {
  initialLiveStreams: LiveStreamFeedItem[];
  canCreateLive: boolean;
}) {
  const [liveStreams, setLiveStreams] = useState(initialLiveStreams);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refreshLiveStreams() {
      try {
        const response = await fetch("/api/live", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { liveStreams: LiveStreamFeedItem[] };

        if (!cancelled) {
          setLiveStreams(data.liveStreams);
          setLastUpdated(new Date());
        }
      } catch {
        // Keep the current list if polling fails.
      }
    }

    const interval = window.setInterval(refreshLiveStreams, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Live Videos</h2>
          <p className="text-sm text-muted-foreground">
            Streams refresh automatically every 5 seconds.
            {lastUpdated ? ` Last checked ${lastUpdated.toLocaleTimeString()}.` : ""}
          </p>
        </div>
        {canCreateLive ? (
          <Link
            href="/live/create"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Radio className="size-4" />
            Go Live
          </Link>
        ) : null}
      </div>

      {liveStreams.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No live videos right now</CardTitle>
            <CardDescription>
              When someone creates a live stream, the watch link will show here automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liveStreams.map((stream) => (
            <Link
              key={stream.cloudflareLiveInputId}
              href={`/live/${stream.cloudflareLiveInputId}`}
              className="group block focus-visible:outline-none"
            >
              <div className="aspect-video overflow-hidden rounded-lg border bg-black transition-colors group-hover:border-foreground/40">
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white">
                    <Radio className="size-3" />
                    LIVE
                  </span>
                  <Play className="size-9 fill-white text-white opacity-90 transition-transform group-hover:scale-105" />
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {(stream.user.name ?? stream.user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="line-clamp-2 text-sm font-medium leading-5 group-hover:underline">
                    {stream.title}
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {stream.user.name ?? stream.user.email ?? "Unknown creator"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[11px]">
                      {stream.status}
                    </Badge>
                    <span>{formatDate(new Date(stream.createdAt))}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
