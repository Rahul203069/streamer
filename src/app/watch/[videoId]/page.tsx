import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoPlayer } from "@/components/video-player";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await prisma.video.findUnique({
    where: {
      cloudflareUid: videoId,
    },
  });

  return (
    <PageShell className="max-w-5xl space-y-6">
      <VideoPlayer videoId={videoId} title={video?.title ?? "Cloudflare video"} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{video?.title ?? "Cloudflare video"}</CardTitle>
            {video?.status ? <Badge variant="secondary">{video.status}</Badge> : null}
          </div>
          <CardDescription>
            {video
              ? `Uploaded ${formatDate(video.createdAt)}`
              : "This video was not found in the local database. Attempting playback by Cloudflare UID."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="break-all font-mono text-sm text-muted-foreground">{videoId}</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
