import Image from "next/image";

import type { BlogPostSummary } from "@/lib/blog/types";

import styles from "./Admin.module.css";
import { PostActions } from "./PostActions";

const date = (value: string | null) => value ? `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC` : "—";

export function AdminPostCard({ post, csrf }: { post: BlogPostSummary; csrf: string }) {
  return <article className={`${styles.panel} ${styles.stack}`}>
    <div className={styles.postThumbnail}>
      {post.featuredImage?.url ? <Image
        alt={post.featuredImage.alt}
        className={styles.postThumbnailImage}
        fill
        sizes="(min-width: 768px) 560px, 100vw"
        src={post.featuredImage.url}
        unoptimized
      /> : <div aria-label="No featured image" className={styles.postThumbnailFallback} role="img">
        <svg aria-hidden="true" fill="none" height="28" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="28"><rect height="16" rx="2" width="18" x="3" y="4" /><circle cx="8" cy="9" r="1.5" /><path d="m3 17 5-5 4 4 3-3 6 6" /></svg>
        <span>Sem capa</span>
      </div>}
    </div>
    <div className={styles.row}><span className={`${styles.status} ${post.status === "published" ? styles.published : ""}`}>{post.status}</span><span className={styles.mono}>r{post.revision}</span></div>
    <h2 className={styles.subtitle}>{post.title}</h2>
    <p className={styles.mono}>/{post.slug}</p>
    <dl className={styles.meta}><div><dt>Atualização</dt><dd>{date(post.updatedAt)}</dd></div><div><dt>Publicação</dt><dd>{date(post.publishedAt)}</dd></div></dl>
    <PostActions csrf={csrf} post={post} />
  </article>;
}
