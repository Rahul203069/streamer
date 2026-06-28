import { Radio } from "lucide-react";
import Link from "next/link";

import { DeleteLiveStreamButton } from "@/components/delete-live-stream-button";
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

type DashboardLiveStream = {
  title: string;
  cloudflareLiveInputId: string;
  status: string;
  createdAt: Date;
};

export function DashboardLiveStreams({
  liveStreams,
}: {
  liveStreams: DashboardLiveStream[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Streams</CardTitle>
        <CardDescription>{liveStreams.length} live inputs created.</CardDescription>
      </CardHeader>
      <CardContent>
        {liveStreams.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {liveStreams.map((stream) => (
              <div
                key={stream.cloudflareLiveInputId}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{stream.title}</p>
                    <Badge variant="secondary">{stream.status}</Badge>
                  </div>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {stream.cloudflareLiveInputId} · {formatDate(stream.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/live/${stream.cloudflareLiveInputId}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "self-start sm:self-auto",
                    )}
                  >
                    <Radio className="size-4" />
                    Watch
                  </Link>
                  <DeleteLiveStreamButton
                    liveInputId={stream.cloudflareLiveInputId}
                    title={stream.title}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground">No live streams yet.</p>
      <Link href="/live/create" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
        Create live stream
      </Link>
    </div>
  );
}
