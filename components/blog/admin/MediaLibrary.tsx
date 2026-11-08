"use client";

/* eslint-disable @next/next/no-img-element -- Runtime media served by the local storage route. */
import { useEffect, useId, useState, type FormEvent } from "react";

import type { BlogMedia, MediaPage, MediaUse } from "@/lib/blog/media-types";

import styles from "./Admin.module.css";
import { Dialog } from "./Dialog";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

export function MediaLibrary({ csrf, onSelect, refresh = 0 }: { csrf: string; onSelect?: (media: BlogMedia) => void; refresh?: number }) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MediaPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<(BlogMedia & { usedBy: MediaUse[] }) | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    adminRequest<MediaPage>(`/api/admin/blog/media?${new URLSearchParams({ q: query, page: String(page), pageSize: "12" })}`, "GET")
      .then(result => { if (active) { setData(result); setError(null); } })
      .catch(error => { if (active) setError(error); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, page, version, refresh]);
  function searchMedia(event: FormEvent) { event.preventDefault(); setLoading(true); setPage(1); setQuery(search.trim()); setVersion(value => value + 1); }
  async function details(media: BlogMedia) {
    setBusy(true); setError(null); setMessage("");
    try { const detail = await adminRequest<BlogMedia & { usedBy: MediaUse[] }>(`/api/admin/blog/media/${media.id}`, "GET"); setSelected(detail); setAlt(detail.alt); setConfirm(false); setConfirmation(""); }
    catch (error) { setError(error as Error); } finally { setBusy(false); }
  }
  async function saveAlt() {
    if (!selected || busy) return;
    setBusy(true); setError(null);
    try {
      const media = await adminRequest<BlogMedia>(`/api/admin/blog/media/${selected.id}`, "PATCH", csrf, { alt });
      setSelected({ ...media, usedBy: selected.usedBy }); setVersion(value => value + 1); setMessage("Texto alternativo da biblioteca atualizado. Posts salvos mantêm o próprio texto alternativo.");
    } catch (error) { setError(error as Error); } finally { setBusy(false); }
  }
  async function remove() {
    if (!selected || busy || confirmation !== selected.fileName) return;
    setBusy(true); setError(null);
    try {
      await adminRequest(`/api/admin/blog/media/${selected.id}`, "DELETE", csrf, { confirmation });
      setSelected(null); setConfirm(false); setConfirmation(""); setMessage("Imagem excluída."); setPage(1); setVersion(value => value + 1);
    } catch (error) { setError(error as Error); } finally { setBusy(false); }
  }
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 12));
  return <div aria-busy={loading || busy} className={`${styles.stack} ${styles.mediaLibrary}`} onKeyDown={event => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) event.preventDefault(); }}>
    <div className={styles.mediaSearch}>
      <label className={styles.field} htmlFor={`${id}-search`}>Buscar por nome ou texto alternativo<input id={`${id}-search`} maxLength={160} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); searchMedia(event); } }} type="search" value={search} /></label>
      <button className={styles.secondary} onClick={searchMedia} type="button">Buscar imagens</button>
    </div>
    <Feedback error={selected ? null : error} success={selected ? "" : message} />
    <p aria-live="polite" className={styles.muted}>{loading ? "Carregando imagens…" : `${data?.total ?? 0} imagem(ns) · página ${page} de ${totalPages}`}</p>
    <div className={styles.mediaGrid}>
      {data?.items.map(media => <article className={`${styles.panel} ${styles.stack}`} key={media.id}>
        <img alt={media.alt || "Imagem sem texto alternativo na biblioteca"} className={styles.mediaThumbnail} height={media.height} loading="lazy" src={media.url} width={media.width} />
        <h3 className={styles.mediaName}>{media.originalName}</h3>
        <p className={styles.muted}>{media.alt || "Alt ainda não informado"}</p>
        <p className={styles.mono}>{media.width} × {media.height} px · {Math.ceil(media.size / 1024)} KB · {media.type}</p>
        <div className={styles.actions}>
          {onSelect && <button className={styles.button} disabled={busy} onClick={() => onSelect(media)} type="button">Selecionar imagem</button>}
          <button aria-label={`Detalhes de ${media.originalName}`} className={styles.secondary} disabled={busy} onClick={() => void details(media)} type="button">Detalhes</button>
        </div>
      </article>)}
    </div>
    {!loading && data?.total === 0 && <p className={styles.notice}>Nenhuma imagem encontrada. Envie uma imagem ou ajuste a busca.</p>}
    {totalPages > 1 && <nav aria-label="Páginas da biblioteca" className={styles.actions}>
      <button className={styles.secondary} disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage(page - 1); }} type="button">Anterior</button>
      <button className={styles.secondary} disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage(page + 1); }} type="button">Próxima</button>
    </nav>}
    <Dialog busy={busy} onClose={() => { setSelected(null); setConfirm(false); setError(null); }} open={!!selected} title="Detalhes da imagem">
      {selected && <>
        <img alt={selected.alt || "Prévia da imagem"} className={styles.image} src={selected.url} />
        <dl className={`${styles.mediaMetadata} ${styles.meta}`}>
          <div><dt>Nome original</dt><dd>{selected.originalName}</dd></div><div><dt>Arquivo</dt><dd>{selected.fileName}</dd></div>
          <div><dt>Dimensões / tamanho</dt><dd>{selected.width} × {selected.height} px · {selected.size} bytes</dd></div>
          <div><dt>Formato / uso</dt><dd>{selected.mimeType} · {selected.type}</dd></div>
          <div><dt>Criada em</dt><dd>{new Date(selected.createdAt).toLocaleString("pt-BR")}</dd></div>
          <div><dt>URL pública</dt><dd><a href={selected.url} rel="noopener noreferrer" target="_blank">{selected.url}</a></dd></div>
        </dl>
        <label className={styles.field} htmlFor={`${id}-alt`}>Texto alternativo da biblioteca<input disabled={busy} id={`${id}-alt`} maxLength={300} onChange={event => setAlt(event.target.value)} value={alt} /></label>
        <Feedback error={error} success={message} />
        <div className={styles.actions}>
          <button className={styles.button} disabled={busy || alt === selected.alt} onClick={() => void saveAlt()} type="button">Salvar alt</button>
          {onSelect && <button className={styles.secondary} disabled={busy} onClick={() => onSelect(selected)} type="button">Usar esta imagem</button>}
        </div>
        {selected.usedBy.length > 0 ? <div className={styles.notice}><p>Em uso — exclusão bloqueada:</p><ul>{selected.usedBy.map(post => <li key={post.id}><a href={`/admin/blog/${post.id}`}>{post.title} ({post.status})</a></li>)}</ul></div> : <>
          {!confirm && <button className={styles.danger} disabled={busy} onClick={() => setConfirm(true)} type="button">Excluir imagem…</button>}
          {confirm && <div className={`${styles.error} ${styles.stack}`}>
            <p>O arquivo será removido permanentemente. Digite o nome abaixo para confirmar:</p><p className={styles.mono}>{selected.fileName}</p>
            <label className={styles.field} htmlFor={`${id}-confirmation`}>Nome do arquivo<input autoComplete="off" disabled={busy} id={`${id}-confirmation`} onChange={event => setConfirmation(event.target.value)} spellCheck={false} value={confirmation} /></label>
            <button className={styles.danger} disabled={busy || confirmation !== selected.fileName} onClick={() => void remove()} type="button">Excluir permanentemente</button>
          </div>}
        </>}
        <button className={styles.secondary} disabled={busy} onClick={() => { setSelected(null); setError(null); }} type="button">Fechar detalhes</button>
      </>}
    </Dialog>
  </div>;
}
