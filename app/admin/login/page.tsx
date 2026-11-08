import { redirect } from "next/navigation";

import styles from "@/components/blog/admin/Admin.module.css";
import { LoginForm } from "@/components/blog/admin/LoginForm";
import { adminPageSession } from "@/lib/blog/admin/access";
import { getAdminConfig } from "@/lib/blog/admin/auth";
import { BlogError } from "@/lib/blog/errors";

export default async function AdminLoginPage() {
  if (await adminPageSession()) redirect("/admin/blog");
  let configured = true;
  try { getAdminConfig(); } catch (error) { if (error instanceof BlogError) configured = false; else throw error; }
  return <section className={styles.root}>
    <div className={`${styles.login} ${styles.panel} ${styles.stack}`}>
      <p className={styles.mono}>AUTOMA SOLUCT / EDITORIAL</p>
      <h1 className={styles.title}>Acesso ao blog</h1>
      <p className={styles.muted}>Entre para editar drafts, revisar e publicar artigos.</p>
      <LoginForm configured={configured} />
    </div>
  </section>;
}
