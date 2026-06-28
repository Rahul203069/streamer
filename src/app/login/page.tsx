import { redirect } from "next/navigation";

import { AuthButton } from "@/components/auth-button";
import { PageShell } from "@/components/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <PageShell className="grid min-h-[calc(100dvh-8rem)] place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Continue with Google to watch, upload, and go live.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthButton />
        </CardContent>
      </Card>
    </PageShell>
  );
}
