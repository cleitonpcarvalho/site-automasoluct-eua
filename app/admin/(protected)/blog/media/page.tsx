import styles from "@/components/blog/admin/Admin.module.css";
import { MediaManager } from "@/components/blog/admin/MediaManager";
import { requireAdminPage } from "@/lib/blog/admin/access";
import { blogUploadLimits } from "@/lib/blog/config";

export default async function AdminMediaPage() {
  const session = await requireAdminPage();
  return <section className={`${styles.root} ${styles.stack}`}>
    <h1 className={styles.title}>Biblioteca de mídia</h1>
    <p className={styles.muted}>Envie e gerencie imagens do blog. Para associar uma imagem, abra o editor do post e escolha da biblioteca.</p>
    <MediaManager csrf={session.csrfToken} maxBytes={blogUploadLimits().maxBytes} />
  </section>;
}
