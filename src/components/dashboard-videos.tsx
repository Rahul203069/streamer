import { Play } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type DashboardVideo = {
  title: string;
  cloudflareUid: string;
  status: string;
  createdAt: Date;
};

export function DashboardVideos({ videos }: { videos: DashboardVideo[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Videos</CardTitle>
        <CardDescription>{videos.length} videos in your library.</CardDescription>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <EmptyState href="/upload" label="Upload a video" />
        ) : (
          <div className="divide-y">
            {videos.map((video) => (
              <div key={video.cloudflareUid} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{video.title}</p>
                    <Badge variant="secondary">{video.status}</Badge>
                  </div>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {video.cloudflareUid} · {formatDate(video.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/watch/${video.cloudflareUid}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "self-start sm:self-auto")}
                >
                  <Play className="size-4" />
                  Watch
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ href, label }: { href: string; label: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
        {label}
      </Link>
    </div>
  );
}
