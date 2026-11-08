import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/blog/admin/Admin.module.css";
import { PostEditor } from "@/components/blog/admin/PostEditor";
import { requireAdminPage } from "@/lib/blog/admin/access";
import { toEditorFields } from "@/lib/blog/admin/editor";
import { listAdminImages } from "@/lib/blog/admin/images";
import { blogUploadLimits } from "@/lib/blog/config";
import { BlogError } from "@/lib/blog/errors";
import { getBlogService } from "@/lib/blog/service";

export default async function AdminPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPage();
  let post;
  let fields;
  try { post = getBlogService().get((await params).id); fields = toEditorFields(post); }
  catch (error) {
    if (!(error instanceof BlogError)) throw error;
    if (error.status === 400 || error.status === 404) notFound();
    return <section className={`${styles.root} ${styles.stack}`}><h1 className={styles.title}>Edição indisponível</h1><p className={styles.error} role="alert">{error.message}</p><Link className={styles.secondary} href="/admin/blog">Voltar aos posts</Link></section>;
  }
  return <section className={styles.root}><PostEditor csrf={session.csrfToken} images={await listAdminImages()} initialFields={fields} initialPost={post} maxUploadBytes={blogUploadLimits().maxBytes} /></section>;
}
