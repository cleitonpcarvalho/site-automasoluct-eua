import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BlogError } from "../errors.ts";
import { getAdminAuth, getAdminConfig } from "./auth.ts";

export async function adminPageSession() {
  try {
    const config = getAdminConfig();
    const token = (await cookies()).get(config.cookieName)?.value;
    return token ? getAdminAuth(config).session(token) : null;
  } catch (error) {
    if (error instanceof BlogError && error.code === "admin_not_configured") return null;
    throw error;
  }
}

// Called in each protected page as well as its layout, before accessing content.
export async function requireAdminPage() {
  const session = await adminPageSession();
  if (!session) redirect("/admin/login");
  return session;
}
