"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { toEditorFields, type EditorBlock, type EditorFields } from "@/lib/blog/admin/editor";
import { BLOG_TEMPLATE } from "@/lib/blog/template";
import type { BlogPost } from "@/lib/blog/types";

import styles from "./Admin.module.css";
import { Feedback } from "./Feedback";
import { ImageField } from "./ImageField";
import { PostActions } from "./PostActions";
import { adminRequest } from "./request";

const fields = [
  ["title", "Título", 240, false], ["subtitle", "Subtítulo", 500, true], ["slug", "Slug", 160, false],
  ["seoTitle", "SEO title", 240, false], ["metaDescription", "Meta description", 500, true],
  ["focusKeyword", "Palavra-chave principal", 200, false], ["excerpt", "Resumo / excerpt", 1000, true],
  ["tagsText", "Tags separadas por vírgula", 1000, false],
] as const;

export function PostEditor({ initialPost, initialFields, csrf, images, maxUploadBytes }: { initialPost: BlogPost; initialFields: EditorFields; csrf: string; images: string[]; maxUploadBytes: number }) {
  const [post, setPost] = useState(initialPost);
  const [value, setValue] = useState(initialFields);
  const [saved, setSaved] = useState(JSON.stringify(initialFields));
  const [saving, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = saving || uploading;
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState("");
  const feedback = useRef<HTMLDivElement>(null);
  const id = useId();
  const dirty = JSON.stringify(value) !== saved;
  const locked = post.status === "published";
  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) { if (dirty) { event.preventDefault(); } }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  function accept(next: BlogPost) {
    const updated = toEditorFields(next);
    setPost(next); setValue(updated); setSaved(JSON.stringify(updated)); setError(null);
  }
  function updateBlock(index: number, block: EditorBlock) {
    setValue(current => ({ ...current, blocks: current.blocks.map((item, position) => position === index ? block : item) }));
    setSuccess("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || locked) return;
    setBusy(true); setError(null); setSuccess("");
    try {
      const result = await adminRequest<BlogPost>(`/api/admin/blog/posts/${post.id}`, "PATCH", csrf, { expectedRevision: post.revision, fields: value });
      accept(result); setSuccess(`Draft salvo. Revisão ${result.revision}.`);
    } catch (error) { setError(error as Error); }
    finally { setBusy(false); feedback.current?.focus(); }
  }
  return <div className={styles.stack}>
    <header className={styles.stack}>
      <h1 className={styles.title}>Editar post</h1>
      <p className={styles.subtitle}>{post.title}</p>
      <p className={styles.mono}>{post.status} · revisão {post.revision} · {dirty ? "alterações não salvas" : "versão salva"}</p>
      {locked && <p className={styles.notice}>Este post está publicado e a edição está bloqueada. Use “Devolver para draft” para retirá-lo do blog público antes de editar.</p>}
    </header>
    <div className={`${styles.sticky} ${styles.stack}`}>
      <div className={styles.actions}>
        <button className={styles.button} disabled={busy || locked || !dirty} form={`${id}-form`} type="submit">{busy ? "Salvando…" : "Salvar como draft"}</button>
        <a className={styles.secondary} href={`/admin/blog/${post.id}`} rel="noopener noreferrer" target="_blank">Abrir versão atual em outra aba</a>
      </div>
      <p className={styles.muted}>{dirty ? `A prévia mostra a revisão ${post.revision} salva. Salve suas alterações antes de publicar.` : "Publicar é uma ação separada. A prévia nunca publica o post."}</p>
      <PostActions csrf={csrf} dirty={dirty || busy} editor onChange={accept} post={post} />
    </div>
    <div ref={feedback} tabIndex={-1}><Feedback error={error} success={success} /></div>
    <form aria-busy={busy} className={styles.stack} id={`${id}-form`} onChange={() => setSuccess("")} onSubmit={save}>
      <fieldset className={`${styles.panel} ${styles.stack}`} disabled={busy || locked}>
        <legend>Dados gerais</legend>
        <div className={styles.grid}>
          {fields.map(([key, label, maxLength, multiline]) => <label className={styles.field} htmlFor={`${id}-${key}`} key={key}>{label}
            {multiline ? <textarea id={`${id}-${key}`} maxLength={maxLength} onChange={event => setValue({ ...value, [key]: event.target.value })} value={value[key]} /> : <input autoComplete="off" id={`${id}-${key}`} maxLength={maxLength} onChange={event => setValue({ ...value, [key]: event.target.value })} pattern={key === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : undefined} required={key === "title" || key === "slug"} spellCheck={key === "slug" ? false : undefined} value={value[key]} />}
            {key === "tagsText" && <small>Até 20 tags, com até 48 caracteres cada.</small>}
          </label>)}
        </div>
      </fieldset>
      <fieldset className={`${styles.panel} ${styles.stack}`} disabled={busy || locked}>
        <legend>Imagem destacada</legend>
        <ImageField csrf={csrf} images={images} label="Imagem destacada" maxBytes={maxUploadBytes} onBusyChange={setUploading} onChange={image => setValue({ ...value, featuredImage: image })} type="featured" value={value.featuredImage} />
      </fieldset>
      <div className={styles.stack}>
        <h2 className={styles.subtitle}>Template editorial · 26 blocos fixos</h2>
        <p className={styles.muted}>A ordem, os tipos, os seis H3 e o formulário final são fixos. Edite somente o conteúdo.</p>
        {value.blocks.map((block, index) => <fieldset className={`${styles.panel} ${styles.block} ${styles.stack}`} data-editor-block={block.id} disabled={busy || locked} key={block.id}>
          <legend>{BLOG_TEMPLATE.slots[index].purpose}</legend>
          {block.type === "text" && <label className={styles.field} htmlFor={`${id}-${block.id}`}>Texto<textarea className={styles.longText} id={`${id}-${block.id}`} maxLength={50000} onChange={event => updateBlock(index, { ...block, content: event.target.value })} value={block.content} /><small>Use uma linha em branco entre parágrafos. As quebras serão preservadas.</small></label>}
          {block.type === "heading" && <label className={styles.field} htmlFor={`${id}-${block.id}`}>Heading H3<input id={`${id}-${block.id}`} maxLength={240} onChange={event => updateBlock(index, { ...block, content: event.target.value })} value={block.content} /></label>}
          {block.type === "cta" && <>
            <label className={styles.field} htmlFor={`${id}-${block.id}-text`}>Texto do CTA<textarea id={`${id}-${block.id}-text`} maxLength={1000} onChange={event => updateBlock(index, { ...block, text: event.target.value })} value={block.text} /></label>
            <div className={styles.grid}>
              <label className={styles.field} htmlFor={`${id}-${block.id}-label`}>Texto do botão<input id={`${id}-${block.id}-label`} maxLength={100} onChange={event => updateBlock(index, { ...block, label: event.target.value })} required value={block.label} /></label>
              <label className={styles.field} htmlFor={`${id}-${block.id}-href`}>Destino<input id={`${id}-${block.id}-href`} maxLength={1000} onChange={event => updateBlock(index, { ...block, href: event.target.value })} required value={block.href} /><small>Caminho do site ou URL HTTPS.</small></label>
            </div>
            <div><p className={styles.muted}>Prévia visual do botão</p><span className={styles.button}>{block.label || "Texto do botão"}</span></div>
          </>}
          {block.type === "image" && <>
            <ImageField csrf={csrf} images={images} label={`Imagem interna ${block.id.split("-").at(-1)}`} maxBytes={maxUploadBytes} onBusyChange={setUploading} onChange={image => updateBlock(index, { ...block, image })} type="internal" value={block.image} />
            <label className={styles.field} htmlFor={`${id}-${block.id}-caption`}>Legenda (opcional)<input id={`${id}-${block.id}-caption`} maxLength={500} onChange={event => updateBlock(index, { ...block, caption: event.target.value })} value={block.caption ?? ""} /></label>
          </>}
          {block.type === "video" && <>
            <label className={styles.field} htmlFor={`${id}-video-url`}>URL do vídeo<input id={`${id}-video-url`} maxLength={1000} onChange={event => setValue({ ...value, videoUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=…" type="url" value={value.videoUrl} /><small>YouTube ou Vimeo via HTTPS. Obrigatório para publicar.</small></label>
            <label className={styles.field} htmlFor={`${id}-video-title`}>Título acessível do vídeo<input id={`${id}-video-title`} maxLength={240} onChange={event => setValue({ ...value, videoTitle: event.target.value })} value={value.videoTitle} /></label>
          </>}
          {block.type === "form" && <div className={styles.notice}><p>Formulário de avaliação técnica existente.</p><p className={styles.mono}>formId: assessment · configuração fixa</p><p className={styles.muted}>A estrutura e o destino do formulário não podem ser alterados neste editor.</p></div>}
        </fieldset>)}
      </div>
      <button className={styles.button} disabled={busy || locked || !dirty} type="submit">{busy ? "Salvando…" : "Salvar como draft"}</button>
    </form>
  </div>;
}
