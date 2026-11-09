"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { BlogPost, BlogPostSummary } from "@/lib/blog/types";

import styles from "./Admin.module.css";
import { Dialog } from "./Dialog";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

type Action = "publish" | "withdraw" | "remove";
type ActionPost = Pick<BlogPostSummary, "id" | "title" | "slug" | "revision" | "status">;

export function PostActions({ post, csrf, dirty = false, editor = false, onChange }: { post: ActionPost; csrf: string; dirty?: boolean; editor?: boolean; onChange?: (post: BlogPost) => void }) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [typedSlug, setTypedSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState("");
  function open(value: Action) { setAction(value); setConfirmed(false); setTypedSlug(""); setError(null); setSuccess(""); }
  async function execute() {
    if (!action || busy) return;
    setBusy(true); setError(null);
    try {
      const suffix = action === "publish" ? "/publish" : action === "withdraw" ? "/draft" : "";
      const result = await adminRequest<BlogPost>(`/api/admin/blog/posts/${post.id}${suffix}`, action === "remove" ? "DELETE" : "POST", csrf, { expectedRevision: post.revision, confirmation: post.slug });
      setAction(null); setSuccess(action === "publish" ? "Publicação concluída." : action === "withdraw" ? "Post devolvido para draft e retirado do blog público." : "Post excluído.");
      if (action === "remove" && editor) { router.replace("/admin/blog?notice=deleted"); router.refresh(); }
      else if (onChange && action !== "remove") onChange(result);
      else router.refresh();
    } catch (error) { setError(error as Error); }
    finally { setBusy(false); }
  }
  return <div className={styles.stack}>
    <div className={styles.actions}>
      {!editor && <a className={styles.secondary} href={`/admin/blog/${post.id}`}>Editar</a>}
      <a className={styles.secondary} href={`/admin/blog/${post.id}/preview?revision=${post.revision}`} rel="noopener noreferrer" target="_blank">Prévia salva r{post.revision}</a>
      {!editor && post.status === "published" && <a className={styles.secondary} href={`/blog/${post.slug}`} rel="noopener noreferrer" target="_blank">View Published Post</a>}
      {post.status === "draft" ? <button className={styles.button} disabled={dirty || busy} onClick={() => open("publish")} type="button">Publicar</button> : <button className={styles.secondary} disabled={dirty || busy} onClick={() => open("withdraw")} type="button">Devolver para draft</button>}
      <button className={styles.danger} disabled={dirty || busy} onClick={() => open("remove")} type="button">Excluir</button>
    </div>
    {!action && <Feedback success={success} />}
    <Dialog busy={busy} onClose={() => { if (!busy) setAction(null); }} open={action !== null} title={action === "remove" ? "Excluir permanentemente?" : action === "withdraw" ? "Retirar do blog público?" : "Confirmar publicação"}>
      <p className={styles.muted}>{post.title}</p>
      <p className={styles.mono}>/{post.slug} · revisão {post.revision}</p>
      <p className={styles.muted}>{action === "remove" ? "Esta exclusão é permanente. As imagens não serão apagadas. Para confirmar, digite o slug abaixo." : action === "withdraw" ? "O post deixará de aparecer para visitantes e poderá ser editado como draft." : "Somente esta revisão salva será publicada. O servidor verificará o template, SEO, vídeo e as cinco imagens antes de publicar."}</p>
      {action === "remove" ? <label className={styles.field} htmlFor={`delete-${post.id}`}>Digite o slug<input autoComplete="off" disabled={busy} id={`delete-${post.id}`} onChange={event => setTypedSlug(event.target.value)} spellCheck={false} value={typedSlug} /></label> : <label className={styles.check}><input checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} type="checkbox" /><span>{action === "withdraw" ? "Confirmo a retirada deste post do blog público." : "Revisei a prévia salva e confirmo a publicação desta revisão."}</span></label>}
      <Feedback error={error} />
      <div className={styles.actions}>
        <button className={styles.secondary} disabled={busy} onClick={() => setAction(null)} type="button">Cancelar</button>
        <button className={action === "remove" ? styles.danger : styles.button} disabled={busy || (action === "remove" ? typedSlug !== post.slug : !confirmed)} onClick={execute} type="button">{busy ? "Processando…" : action === "remove" ? "Excluir permanentemente" : action === "withdraw" ? "Devolver para draft" : `Publicar revisão ${post.revision}`}</button>
      </div>
    </Dialog>
  </div>;
}
