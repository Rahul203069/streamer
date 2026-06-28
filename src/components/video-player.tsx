import { AlertCircle } from "lucide-react";

import { streamIframeUrl } from "@/lib/cloudflare";

export function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const src = streamIframeUrl(videoId);

  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted p-6 text-center text-sm text-muted-foreground">
        <div className="max-w-md">
          <AlertCircle className="mx-auto mb-3 size-5" />
          Set NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE to render the Cloudflare player.
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg border bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}
