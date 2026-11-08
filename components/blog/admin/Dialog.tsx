"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import styles from "./Admin.module.css";

export function Dialog({ open, onClose, title, busy, children, wide = false }: { open: boolean; onClose: () => void; title: string; busy?: boolean; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog aria-busy={busy} aria-labelledby={titleId} className={wide ? styles.mediaDialog : undefined} onCancel={event => { if (busy) event.preventDefault(); }} onClose={onClose} ref={ref}>
    <div className={styles.stack}>
      <h2 className={styles.subtitle} id={titleId}>{title}</h2>
      {children}
    </div>
  </dialog>;
}
