"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { BlogPost } from "@/lib/blog/types";

import styles from "./Admin.module.css";
import { Dialog } from "./Dialog";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

export function NewPostButton({ csrf }: { csrf: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    try {
      const slug = String(data.get("slug") ?? "").trim();
      const post = await adminRequest<BlogPost>("/api/admin/blog/posts", "POST", csrf, { title: data.get("title"), ...(slug ? { slug } : {}) });
      router.push(`/admin/blog/${post.id}`);
    } catch (error) { setError(error as Error); setBusy(false); }
  }
  return <>
    <button className={styles.button} onClick={() => { setOpen(true); setError(null); }} type="button">Novo draft</button>
    <Dialog busy={busy} onClose={() => { if (!busy) setOpen(false); }} open={open} title="Criar draft">
      <form aria-busy={busy} className={styles.stack} onSubmit={create}>
        <label className={styles.field} htmlFor="new-title">Título<input disabled={busy} id="new-title" maxLength={240} name="title" required /></label>
        <label className={styles.field} htmlFor="new-slug">Slug (opcional)<input disabled={busy} id="new-slug" maxLength={160} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" /><small>Se estiver vazio, será criado a partir do título.</small></label>
        <p className={styles.muted}>Os 26 blocos fixos serão preparados para edição. Nenhum conteúdo será publicado.</p>
        <Feedback error={error} />
        <div className={styles.actions}><button className={styles.secondary} disabled={busy} onClick={() => setOpen(false)} type="button">Cancelar</button><button className={styles.button} disabled={busy} type="submit">{busy ? "Criando…" : "Criar draft"}</button></div>
      </form>
    </Dialog>
  </>;
}
