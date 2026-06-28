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

export default async function LiveWatchPage({
  params,
}: {
  params: Promise<{ liveInputId: string }>;
}) {
  const { liveInputId } = await params;
  const liveStream = await prisma.liveStream.findUnique({
    where: {
      cloudflareLiveInputId: liveInputId,
    },
  });

  return (
    <PageShell className="max-w-5xl space-y-6">
      <VideoPlayer videoId={liveInputId} title={liveStream?.title ?? "Live stream"} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{liveStream?.title ?? "Live stream"}</CardTitle>
            {liveStream?.status ? <Badge variant="secondary">{liveStream.status}</Badge> : null}
          </div>
          <CardDescription>
            {liveStream
              ? `Created ${formatDate(liveStream.createdAt)}`
              : "This live input was not found in the local database. Attempting playback by Cloudflare ID."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="break-all font-mono text-sm text-muted-foreground">{liveInputId}</p>
          <p className="text-sm text-muted-foreground">
            If the stream is not playing, the creator may not be live yet.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
