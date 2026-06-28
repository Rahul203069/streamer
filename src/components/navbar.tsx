import { Radio, Upload, Video } from "lucide-react";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Video className="size-5" />
          <span>Cloudflare Video</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            My Studio
          </Link>
          <Link
            href="/upload"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            <Upload className="size-4" />
            Upload
          </Link>
          <Link
            href="/live/create"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            <Radio className="size-4" />
            Live
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "md:hidden",
              )}
            >
              Home
            </Link>
          ) : null}
          <ThemeToggle />
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}
