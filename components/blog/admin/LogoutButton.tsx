"use client";

import { useState } from "react";

import styles from "./Admin.module.css";
import { Feedback } from "./Feedback";
import { adminRequest } from "./request";

export function LogoutButton({ csrf }: { csrf: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  return <div>
    <button className={styles.secondary} disabled={busy} onClick={async () => {
      setBusy(true); setError(null);
      try { await adminRequest("/api/admin/logout", "POST", csrf); window.location.replace("/admin/login"); }
      catch (error) { setError(error as Error); setBusy(false); }
    }} type="button">{busy ? "Saindo…" : "Sair"}</button>
    <Feedback error={error} />
  </div>;
}
