"use client";

import { Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadResult = {
  videoUid: string;
};

type UploadStep = "idle" | "creating" | "uploading" | "saving";

export function UploadVideoForm() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !file) {
      toast.error("Add a title and choose a video file.");
      return;
    }

    setLoading(true);
    setUploadStep("creating");
    setUploadProgress(0);
    setResult(null);

    try {
      const uploadResponse = await fetch("/api/videos/create-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      const uploadData = (await uploadResponse.json()) as {
        uploadURL?: string;
        videoUid?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !uploadData.uploadURL || !uploadData.videoUid) {
        throw new Error(uploadData.error || "Could not create upload URL.");
      }

      const formData = new FormData();
      formData.append("file", file);

      setUploadStep("uploading");
      await uploadFileToCloudflare(uploadData.uploadURL, formData, setUploadProgress);

      setUploadStep("saving");
      const completeResponse = await fetch("/api/videos/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUid: uploadData.videoUid }),
      });

      if (!completeResponse.ok) {
        const completeData = (await completeResponse.json()) as { error?: string };
        throw new Error(completeData.error || "Upload completed, but status update failed.");
      }

      setResult({ videoUid: uploadData.videoUid });
      setUploadProgress(100);
      toast.success("Video uploaded to Cloudflare.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
      setUploadStep("idle");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          The file goes directly from your browser to Cloudflare Stream.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Video title</Label>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="My first video"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Video file</Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              required
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          {loading ? (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{uploadStepLabel(uploadStep)}</span>
                <span className="tabular-nums text-muted-foreground">
                  {uploadStep === "uploading" ? `${uploadProgress}%` : ""}
                </span>
              </div>
              <Progress
                value={
                  uploadStep === "creating"
                    ? 8
                    : uploadStep === "saving"
                      ? 100
                      : uploadProgress
                }
              />
            </div>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {loading ? "Uploading" : "Upload"}
          </Button>
        </form>

        {result ? (
          <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm">
            <p className="font-medium">Cloudflare UID</p>
            <p className="mt-1 break-all font-mono text-muted-foreground">{result.videoUid}</p>
            <Link
              href={`/watch/${result.videoUid}`}
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
            >
              Open watch page
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function uploadStepLabel(step: UploadStep) {
  if (step === "creating") {
    return "Preparing upload";
  }

  if (step === "saving") {
    return "Saving video";
  }

  if (step === "uploading") {
    return "Uploading to Cloudflare";
  }

  return "Ready";
}

function uploadFileToCloudflare(
  uploadURL: string,
  formData: FormData,
  onProgress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", uploadURL);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
      onProgress(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error("Cloudflare upload failed."));
    };

    xhr.onerror = () => reject(new Error("Cloudflare upload failed."));
    xhr.onabort = () => reject(new Error("Cloudflare upload was cancelled."));

    xhr.send(formData);
  });
}
