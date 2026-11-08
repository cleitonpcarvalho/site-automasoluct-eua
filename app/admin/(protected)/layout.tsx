import Link from "next/link";
import type { ReactNode } from "react";

import styles from "@/components/blog/admin/Admin.module.css";
import { LogoutButton } from "@/components/blog/admin/LogoutButton";
import { requireAdminPage } from "@/lib/blog/admin/access";

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  return <>
    <div className={styles.root} style={{ paddingBottom: 0 }}>
      <nav aria-label="Administração do blog" className={styles.nav}>
        <div className={styles.row}><Link href="/admin/blog">Automa Soluct · Blog Admin</Link><Link href="/admin/blog/media">Biblioteca de mídia</Link></div>
        <div className={styles.row}><span className={styles.mono}>{session.login}</span><LogoutButton csrf={session.csrfToken} /></div>
      </nav>
    </div>
    {children}
  </>;
}
