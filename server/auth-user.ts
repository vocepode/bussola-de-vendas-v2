import type { User } from "../drizzle/schema";
import { hasAdminPrivileges } from "./admin-access";

export type AuthMeUser = {
  id: number;
  name: string | null;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  avatarUrl: string | null;
  mustChangePassword: boolean;
};

export function toAuthMeUser(user: User | null | undefined): AuthMeUser | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: hasAdminPrivileges(user) ? "admin" : "user",
    isActive: user.isActive,
    avatarUrl: user.avatarUrl ?? null,
    mustChangePassword: user.mustChangePassword,
  };
}
