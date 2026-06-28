import { PageShell } from "@/components/page-shell";
import { UploadVideoForm } from "@/components/upload-video-form";
import { requireAuth } from "@/lib/require-auth";

export default async function UploadPage() {
  await requireAuth();

  return (
    <PageShell className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upload Video</h1>
        <p className="mt-2 text-muted-foreground">
          Create a Cloudflare direct upload URL and send the file from the browser.
        </p>
      </div>
      <UploadVideoForm />
    </PageShell>
  );
}
