"use client";

import type { ApiResourceStatus } from "@/lib/useApiResource";

export function ApiDataNotice({
  status,
  error,
}: {
  status: ApiResourceStatus;
  error: string | null;
}) {
  if (status === "api") {
    return null;
  }

  const message =
    status === "idle"
      ? "Select a record to load its backend data."
      : status === "loading"
        ? "Loading data from the configured backend."
        : status === "error"
          ? `Backend request failed: ${error ?? "unknown error"}. No fallback records are used.`
          : "Backend URL is not configured. No fallback records are used.";
  const style =
    status === "error" || status === "unavailable"
      ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-200"
      : "border-white/10 bg-white/[0.03] text-slate-400";

  return (
    <p role={status === "error" || status === "unavailable" ? "alert" : "status"} aria-live="polite" className={`rounded-xl border px-3 py-2 text-xs ${style}`}>
      {message}
    </p>
  );
}
