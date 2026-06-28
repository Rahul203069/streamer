import { CreateLiveForm } from "@/components/create-live-form";
import { PageShell } from "@/components/page-shell";
import { isAdminSession } from "@/lib/admin";
import { requireAuth } from "@/lib/require-auth";
import { redirect } from "next/navigation";

export default async function CreateLivePage() {
  const session = await requireAuth();

  if (!isAdminSession(session)) {
    redirect("/");
  }

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
