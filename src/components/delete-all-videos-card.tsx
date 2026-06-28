"use client";

import { Loader2, Trash2 } from "lucide-react";
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

type DeleteAllResponse = {
  totalCount?: number;
  deletedCount?: number;
  failedCount?: number;
  error?: string;
};

export function DeleteAllVideosCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function deleteAllVideos() {
    setLoading(true);

    try {
      const response = await fetch("/api/videos/delete-all", {
        method: "DELETE",
      });
      const data = (await response.json()) as DeleteAllResponse;

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || "Could not delete videos.");
      }

      if ((data.failedCount ?? 0) > 0) {
        toast.error(
          `Deleted ${data.deletedCount ?? 0} of ${data.totalCount ?? 0} videos. ${
            data.failedCount
          } failed.`,
        );
      } else {
        toast.success(`Deleted ${data.deletedCount ?? 0} videos.`);
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete videos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trash2 className="size-5 text-destructive" />
          Admin Video Controls
        </CardTitle>
        <CardDescription>
          Delete every uploaded video from Cloudflare Stream and remove local records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button type="button" variant="destructive" />}>
            <Trash2 className="size-4" />
            Delete all videos
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete all uploaded videos?</DialogTitle>
              <DialogDescription>
                This permanently deletes every video record in the app and removes each video from
                Cloudflare Stream when possible. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={loading} />}>
                Cancel
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteAllVideos}
                disabled={loading}
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Delete all
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
