"use client";

import type { ApiResourceStatus } from "@/lib/useApiResource";

export function ApiDataNotice({
  status,
  error,
}: {
  status: ApiResourceStatus;
  error: string | null;
}) {
  const message =
    status === "loading"
      ? "Loading backend simulation data; bundled demo data remains available."
      : status === "api"
        ? "Using backend DEMO SIMULATION data."
        : status === "error"
          ? `Backend request failed: ${error ?? "unknown error"}. Showing bundled demo data.`
          : "Using bundled fictional demo data.";
  const style =
    status === "error"
      ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-200"
      : "border-white/10 bg-white/[0.03] text-slate-400";

  return (
    <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`rounded-xl border px-3 py-2 text-xs ${style}`}>
      {message}
    </p>
  );
}
