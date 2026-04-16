"use client";

/**
 * Read the CSRF cookie value for inclusion in the X-CSRF-Token header.
 * The middleware sets this cookie on first visit.
 */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)pf_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Wrapper around fetch that automatically includes the CSRF token
 * header on state-changing requests.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const needsCsrf = method !== "GET" && method !== "HEAD";
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (needsCsrf) {
    const token = getCsrfToken();
    if (token) headers.set("X-CSRF-Token", token);
  }
  return fetch(input, { ...init, headers, credentials: "same-origin" });
}
