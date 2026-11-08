import { AdminRequestError } from "./request";
import styles from "./Admin.module.css";

export function Feedback({ error, success }: { error?: Error | null; success?: string }) {
  if (error) return <div className={styles.error} role="alert" tabIndex={-1}>
    <p>{error.message}</p>
    {error instanceof AdminRequestError && error.details.length > 0 && <ul className="mt-2 list-disc pl-5">{error.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}
    {error instanceof AdminRequestError && error.code === "admin_unauthorized" && <a className={styles.secondary} href="/admin/login" rel="noopener noreferrer" target="_blank">Entrar em outra aba</a>}
  </div>;
  return success ? <p className={styles.success} role="status">{success}</p> : null;
}
