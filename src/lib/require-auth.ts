import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session as AuthenticatedSession;
}
