"use client";

import { useId, useRef, useState } from "react";

import type { BlogMedia, BlogMediaType } from "@/lib/blog/media-types";

import styles from "./Admin.module.css";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

export function MediaUpload({ csrf, alt, type, maxBytes, onUploaded, onBusyChange }: { csrf: string; alt: string; type: BlogMediaType; maxBytes: number; onUploaded: (media: BlogMedia) => void; onBusyChange?: (busy: boolean) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState("");
  async function upload(image: File | undefined) {
    if (!image || busy) return;
    setError(null); setSuccess("");
    if (image.size > maxBytes) { setError(new Error("A imagem excede o limite informado.")); if (file.current) file.current.value = ""; return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(image.type)) { setError(new Error("Selecione PNG, JPEG ou WebP.")); if (file.current) file.current.value = ""; return; }
    setBusy(true); onBusyChange?.(true);
    try {
      const data = new FormData(); data.set("file", image); data.set("alt", alt); data.set("type", type);
      const media = await adminRequest<BlogMedia>("/api/admin/blog/media", "POST", csrf, data);
      onUploaded(media); setSuccess("Imagem enviada com sucesso.");
    } catch (error) { setError(error as Error); }
    finally { setBusy(false); onBusyChange?.(false); if (file.current) file.current.value = ""; }
  }
  return <div aria-busy={busy} className={styles.stack}>
    <div className={styles.actions}>
      <button aria-describedby={`${id}-hint`} className={styles.secondary} disabled={busy} onClick={() => file.current?.click()} type="button">{busy ? "Enviando imagem…" : "Enviar imagem"}</button>
      <input accept="image/png,image/jpeg,image/webp" aria-label="Arquivo de imagem" hidden onChange={event => void upload(event.target.files?.[0])} ref={file} tabIndex={-1} type="file" />
    </div>
    <p className={styles.muted} id={`${id}-hint`}>PNG, JPEG ou WebP · até {Number((maxBytes / 1024 / 1024).toFixed(2))} MB · 24 MP. O arquivo terá uma URL pública após o envio.</p>
    <Feedback error={error} success={success} />
  </div>;
}
