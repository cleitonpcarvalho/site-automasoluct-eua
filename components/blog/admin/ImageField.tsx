"use client";

/* eslint-disable @next/next/no-img-element -- Local runtime files; native image preserves arbitrary aspect ratios in the editor. */
import { useId, useState } from "react";

import { isEditorImageUrl, type EditorImage } from "@/lib/blog/admin/editor";
import type { BlogMedia, BlogMediaType } from "@/lib/blog/media-types";

import styles from "./Admin.module.css";
import { Dialog } from "./Dialog";
import { MediaLibrary } from "./MediaLibrary";
import { MediaUpload } from "./MediaUpload";

export function ImageField({ label, value, onChange, images, csrf, type, maxBytes, onBusyChange }: { label: string; value: EditorImage | null; onChange: (value: EditorImage | null) => void; images: string[]; csrf: string; type: BlogMediaType; maxBytes: number; onBusyChange: (busy: boolean) => void }) {
  const id = useId();
  const [library, setLibrary] = useState(false);
  function select(media: BlogMedia) { onChange({ ...(media.provenance ? { provenance: media.provenance } : {}), url: media.url, alt: value?.alt.trim() ? value.alt : media.alt }); setLibrary(false); }
  return <div className={styles.stack}>
    <label className={styles.field} htmlFor={`${id}-alt`}>Texto alternativo — {label}<input id={`${id}-alt`} maxLength={300} onChange={event => onChange({ ...value, url: value?.url ?? "", alt: event.target.value })} required={!!value?.url.trim()} value={value?.alt ?? ""} /><small>Descreva o conteúdo e a função da imagem.</small></label>
    <MediaUpload alt={value?.alt ?? ""} csrf={csrf} maxBytes={maxBytes} onBusyChange={onBusyChange} onUploaded={select} type={type} />
    <div className={styles.actions}><button className={styles.secondary} onClick={() => setLibrary(true)} type="button">Escolher da biblioteca</button>{value?.url && <button className={styles.secondary} onClick={() => onChange(null)} type="button">Remover seleção</button>}</div>
    <Dialog onClose={() => setLibrary(false)} open={library} title={`Biblioteca — ${label}`} wide>
      {library && <MediaLibrary csrf={csrf} onSelect={select} />}
      <button className={styles.secondary} onClick={() => setLibrary(false)} type="button">Fechar biblioteca</button>
    </Dialog>
    <details className={styles.stack}>
    <summary className={styles.mediaSummary}>Usar URL de imagem existente</summary>
    <label className={styles.field} htmlFor={`${id}-url`}>{label} — URL existente
      <input autoComplete="off" id={`${id}-url`} list={`${id}-images`} maxLength={200} onChange={event => onChange({ url: event.target.value, alt: value?.alt ?? "" })} placeholder="/uploads/blog/uuid.png" spellCheck={false} value={value?.url ?? ""} />
      <small>Alternativa para arquivos já armazenados em /uploads/blog/.</small>
    </label>
    <datalist id={`${id}-images`}>{images.map(url => <option key={url} value={url} />)}</datalist>
    {images.length > 0 && <label className={styles.field} htmlFor={`${id}-select`}>Selecionar da biblioteca<select id={`${id}-select`} onChange={event => { if (event.target.value) onChange({ url: event.target.value, alt: value?.alt ?? "" }); }} value=""><option value="">Escolher imagem existente…</option>{images.map(url => <option key={url} value={url}>{url.split("/").at(-1)}</option>)}</select></label>}
    </details>
    {value?.url && isEditorImageUrl(value.url) && <img alt={value.alt || "Prévia da imagem selecionada"} className={styles.image} loading="lazy" src={value.url} />}
    {value?.url && <p className={styles.muted}>Imagem selecionada. Salve o draft para registrar a associação ao post.</p>}
    {value?.url && !isEditorImageUrl(value.url) && <p className={styles.error}>Use uma referência válida de /uploads/blog/. Nenhuma URL externa será carregada.</p>}
  </div>;
}
