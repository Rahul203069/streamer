import { CreateLiveForm } from "@/components/create-live-form";
import { PageShell } from "@/components/page-shell";
import { requireAuth } from "@/lib/require-auth";

export default async function CreateLivePage() {
  await requireAuth();

  return (
    <PageShell className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create Live Stream</h1>
        <p className="mt-2 text-muted-foreground">
          Generate RTMPS credentials for OBS using Cloudflare Live Inputs.
        </p>
      </div>
      <CreateLiveForm />
    </PageShell>
  );
}
