"use client";

import { useState, type FormEvent } from "react";

import styles from "./Admin.module.css";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

export function LoginForm({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    try {
      await adminRequest("/api/admin/login", "POST", undefined, { login: form.get("login"), password: form.get("password") });
      window.location.replace("/admin/blog");
    } catch (error) { setError(error as Error); setBusy(false); }
  }
  return <form aria-busy={busy} className={styles.stack} onSubmit={submit}>
    {!configured && <p className={styles.notice} role="status">O acesso administrativo ainda não está configurado. Defina as variáveis de ambiente descritas em docs/blog-admin.md no servidor.</p>}
    <Feedback error={error} />
    <label className={styles.field} htmlFor="admin-login">Usuário ou e-mail<input autoCapitalize="none" autoComplete="username" disabled={!configured || busy} id="admin-login" maxLength={254} name="login" required spellCheck={false} /></label>
    <label className={styles.field} htmlFor="admin-password">Senha<input autoComplete="current-password" disabled={!configured || busy} id="admin-password" maxLength={1024} name="password" required type="password" /></label>
    <button className={styles.button} disabled={!configured || busy} type="submit">{busy ? "Entrando…" : "Entrar"}</button>
  </form>;
}
