"use client";

import { useId, useState } from "react";

import type { BlogMediaType } from "@/lib/blog/media-types";

import styles from "./Admin.module.css";
import { MediaLibrary } from "./MediaLibrary";
import { MediaUpload } from "./MediaUpload";

export function MediaManager({ csrf, maxBytes }: { csrf: string; maxBytes: number }) {
  const id = useId();
  const [alt, setAlt] = useState("");
  const [type, setType] = useState<BlogMediaType>("other");
  const [refresh, setRefresh] = useState(0);
  return <div className={styles.stack}>
    <section className={`${styles.panel} ${styles.stack}`} aria-labelledby={`${id}-title`}>
      <h2 className={styles.subtitle} id={`${id}-title`}>Enviar imagem</h2>
      <div className={styles.grid}>
        <label className={styles.field} htmlFor={`${id}-alt`}>Texto alternativo<input id={`${id}-alt`} maxLength={300} onChange={event => setAlt(event.target.value)} value={alt} /></label>
        <label className={styles.field} htmlFor={`${id}-type`}>Uso inicial<select id={`${id}-type`} onChange={event => setType(event.target.value as BlogMediaType)} value={type}><option value="other">Outro</option><option value="featured">Destaque</option><option value="internal">Imagem interna</option></select></label>
      </div>
      <MediaUpload alt={alt} csrf={csrf} maxBytes={maxBytes} onUploaded={() => setRefresh(value => value + 1)} type={type} />
    </section>
    <MediaLibrary csrf={csrf} refresh={refresh} />
  </div>;
}
