"use client";

export class AdminRequestError extends Error {
  constructor(message: string, public code: string, public details: string[] = []) { super(message); }
}

export async function adminRequest<T>(url: string, method: string, csrf?: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const multipart = body instanceof FormData;
    const response = await fetch(url, {
      method, credentials: "same-origin", cache: "no-store", signal: controller.signal,
      headers: { ...(body === undefined || multipart ? {} : { "Content-Type": "application/json" }), ...(csrf ? { "X-CSRF-Token": csrf } : {}) },
      ...(body === undefined ? {} : { body: multipart ? body : JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok) {
      const code = result.error?.code ?? "request_failed";
      const message = code === "revision_conflict" ? "Conflito de revisão: outra alteração foi salva. Seu texto foi mantido. Abra a versão atual em outra aba antes de continuar."
        : code === "admin_unauthorized" ? "Sua sessão expirou. Entre novamente em outra aba e tente salvar sem fechar este editor."
        : result.error?.message ?? "Não foi possível concluir a ação.";
      throw new AdminRequestError(message, code, result.error?.details ?? []);
    }
    return result.data as T;
  } catch (error) {
    if (error instanceof AdminRequestError) throw error;
    throw new AdminRequestError("Não foi possível confirmar a resposta do servidor. Verifique a versão salva em outra aba antes de repetir a ação.", "network_error");
  } finally { window.clearTimeout(timeout); }
}
