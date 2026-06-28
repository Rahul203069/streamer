"use client";

import { Loader2, Radio } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { CopyButton } from "@/components/copy-button";
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
import { cn } from "@/lib/utils";

type LiveResult = {
  liveInputId: string;
  rtmpsUrl: string;
  streamKey: string;
  watchUrl: string;
};

export function CreateLiveForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiveResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Add a live stream title.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/live/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = (await response.json()) as LiveResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not create live input.");
      }

      setResult(data);
      toast.success("Live input created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create live input.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Create Live Stream</CardTitle>
        <CardDescription>
          Create a Cloudflare Live Input and copy the RTMPS credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="live-title">Live stream title</Label>
            <Input
              id="live-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="My first live stream"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
            {loading ? "Creating" : "Create live stream"}
          </Button>
        </form>

        {result ? (
          <div className="mt-6 space-y-4 rounded-lg border bg-muted/50 p-4 text-sm">
            <CredentialRow label="RTMPS URL" value={result.rtmpsUrl} />
            <CredentialRow label="Stream key" value={result.streamKey} secret />
            <Link
              href={result.watchUrl}
              className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
            >
              Open live watch page
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CredentialRow({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
      <p className="font-medium">{label}</p>
      <code className="min-w-0 break-all rounded-md bg-background px-3 py-2 font-mono text-xs">
        {secret ? value : value}
      </code>
      <CopyButton value={value} label={label} />
    </div>
  );
}
