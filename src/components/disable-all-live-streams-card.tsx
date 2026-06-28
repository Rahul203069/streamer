"use client";

import { Loader2, OctagonAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DisableAllResponse = {
  totalCount?: number;
  disabledCount?: number;
  failedCount?: number;
  error?: string;
};

export function DisableAllLiveStreamsCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function disableAllLiveStreams() {
    setLoading(true);

    try {
      const response = await fetch("/api/live/disable-all", {
        method: "POST",
      });
      const data = (await response.json()) as DisableAllResponse;

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || "Could not disable live streams.");
      }

      if ((data.failedCount ?? 0) > 0) {
        toast.error(
          `Disabled ${data.disabledCount ?? 0} of ${data.totalCount ?? 0} live streams. ${
            data.failedCount
          } failed.`,
        );
      } else {
        toast.success(`Disabled ${data.disabledCount ?? 0} live streams.`);
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disable live streams.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <OctagonAlert className="size-5 text-destructive" />
          Admin Live Controls
        </CardTitle>
        <CardDescription>
          Stop every non-ended live input across the platform and remove it from the live feed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button" variant="destructive" />}>
            <OctagonAlert className="size-4" />
            Disable all live streams
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable all live streams?</DialogTitle>
              <DialogDescription>
                This stops all non-ended Cloudflare Live Inputs for every user. Creators will need
                to create a new live stream before they can stream again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
                Cancel
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={disableAllLiveStreams}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <OctagonAlert className="size-4" />
                )}
                Disable all
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
