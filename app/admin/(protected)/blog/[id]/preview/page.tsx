import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/BlogArticle";
import styles from "@/components/blog/admin/Admin.module.css";
import { requireAdminPage } from "@/lib/blog/admin/access";
import { getAdminPreview } from "@/lib/blog/admin/handlers";
import { BlogError } from "@/lib/blog/errors";
import { getBlogService } from "@/lib/blog/service";

export default async function AdminPreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ revision?: string }> }) {
  await requireAdminPage();
  const id = (await params).id;
  let post;
  try {
    const revision = (await searchParams).revision;
    if (typeof revision !== "string" || !/^[1-9][0-9]*$/.test(revision)) notFound();
    post = getAdminPreview(getBlogService(), id, Number(revision));
  } catch (error) {
    if (!(error instanceof BlogError)) throw error;
    if (error.status === 400 || error.status === 404) notFound();
    return <section className={`${styles.root} ${styles.stack}`}><h1 className={styles.title}>Prévia desatualizada</h1><p className={styles.error} role="alert">A revisão salva mudou. Reabra a prévia a partir do editor.</p><Link className={styles.secondary} href={`/admin/blog/${id}`}>Voltar ao editor</Link></section>;
  }
  return <>
    <div className={styles.root}><div className={`${styles.notice} ${styles.stack}`}>
      <h2 className={styles.subtitle}>Prévia privada · revisão {post.revision}</h2>
      <p>Estado: {post.status}. Esta é a revisão salva; alterações não salvas no editor não aparecem aqui.</p>
      <Link className={styles.secondary} href={`/admin/blog/${post.id}`}>Voltar ao editor</Link>
    </div></div>
    <BlogArticle post={post} />
  </>;
}
