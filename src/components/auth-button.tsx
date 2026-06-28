"use client";

import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (session?.user) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/" })}
        disabled={loading}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      disabled={loading}
    >
      <LogIn className="size-4" />
      Sign in
    </Button>
  );
}
