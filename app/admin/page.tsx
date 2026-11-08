import { redirect } from "next/navigation";

import { requireAdminPage } from "@/lib/blog/admin/access";

export default async function AdminPage() { await requireAdminPage(); redirect("/admin/blog"); }
