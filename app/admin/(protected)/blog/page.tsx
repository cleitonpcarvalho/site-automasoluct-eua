import Link from "next/link";

import styles from "@/components/blog/admin/Admin.module.css";
import { NewPostButton } from "@/components/blog/admin/NewPostButton";
import { PostActions } from "@/components/blog/admin/PostActions";
import { requireAdminPage } from "@/lib/blog/admin/access";
import { adminListQuery } from "@/lib/blog/admin/handlers";
import { BlogError } from "@/lib/blog/errors";
import { getBlogService } from "@/lib/blog/service";

const date = (value: string | null) => value ? `${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(new Date(value))} UTC` : "—";

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminPage();
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["q", "status", "page"]) if (typeof params[key] === "string" && params[key]) query.set(key, params[key]);
  let posts;
  try { posts = getBlogService().list(adminListQuery(query)); }
  catch (error) {
    if (!(error instanceof BlogError)) throw error;
    return <section className={`${styles.root} ${styles.stack}`}><h1 className={styles.title}>Posts</h1><p className={styles.error} role="alert">Filtro inválido.</p><Link className={styles.secondary} href="/admin/blog">Limpar filtros</Link></section>;
  }
  const link = (page: number) => { const next = new URLSearchParams(query); next.set("page", String(page)); return `/admin/blog?${next}`; };
  return <section className={`${styles.root} ${styles.stack}`}>
    <header className={styles.nav}><div className={styles.stack}><h1 className={styles.title}>Posts do blog</h1><p className={styles.muted}>{posts.total} post(s) · atualização mais recente primeiro</p></div><NewPostButton csrf={session.csrfToken} /></header>
    {params.notice === "deleted" && <p className={styles.success} role="status">Post excluído permanentemente.</p>}
    <form action="/admin/blog" className={`${styles.panel} ${styles.filters}`} method="get">
      <label className={styles.field} htmlFor="post-search">Buscar título ou slug<input defaultValue={query.get("q") ?? ""} id="post-search" maxLength={160} name="q" type="search" /></label>
      <label className={styles.field} htmlFor="post-status">Status<select defaultValue={query.get("status") ?? ""} id="post-status" name="status"><option value="">Todos</option><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <button className={styles.button} type="submit">Filtrar</button>
    </form>
    {posts.items.length ? <div className={styles.postList}>{posts.items.map(post => <article className={`${styles.panel} ${styles.stack}`} key={post.id}>
      <div className={styles.row}><span className={`${styles.status} ${post.status === "published" ? styles.published : ""}`}>{post.status}</span><span className={styles.mono}>r{post.revision}</span></div>
      <h2 className={styles.subtitle}>{post.title}</h2>
      <p className={styles.mono}>/{post.slug}</p>
      <dl className={styles.meta}><div><dt>Atualização</dt><dd>{date(post.updatedAt)}</dd></div><div><dt>Publicação</dt><dd>{date(post.publishedAt)}</dd></div></dl>
      <PostActions csrf={session.csrfToken} post={post} />
    </article>)}</div> : <p className={styles.panel}>Nenhum post encontrado. Crie um draft ou ajuste os filtros.</p>}
    {(posts.total > posts.pageSize || posts.page > 1) && <nav aria-label="Paginação de posts" className={styles.actions}>
      {posts.page > 1 && <Link className={styles.secondary} href={link(posts.page - 1)}>Anterior</Link>}
      <span className={styles.muted}>Página {posts.page} de {Math.max(1, Math.ceil(posts.total / posts.pageSize))}</span>
      {posts.page * posts.pageSize < posts.total && <Link className={styles.secondary} href={link(posts.page + 1)}>Próxima</Link>}
    </nav>}
  </section>;
}
