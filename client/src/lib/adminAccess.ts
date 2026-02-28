type ClientUserLike = {
  email?: string | null;
  role?: "user" | "admin" | string | null;
} | null | undefined;

const FORCED_ADMIN_EMAILS = new Set([
  "daniel@vocepode.pro",
  "suporte@vocepodevendermais.com.br",
]);

export function isForcedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return FORCED_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function hasClientAdminPrivileges(user: ClientUserLike): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return isForcedAdminEmail(user.email);
}
