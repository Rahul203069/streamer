import type { Session } from "next-auth";

const ADMIN_EMAILS = new Set(["rs3296471t@gmail.com", "rs3296472t@gmail.com"]);

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()));
}

export function isAdminSession(session: Session | null) {
  return isAdminEmail(session?.user?.email);
}
