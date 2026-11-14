"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, isBackendConfigured } from "@/lib/api";

export type ApiResourceStatus = "mock" | "loading" | "api" | "error";

type ApiResourceResult<T> =
  | { key: string; version: number; status: "api"; data: T }
  | { key: string; version: number; status: "error"; error: string };

export function useApiResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  fallback: T,
  enabled = true,
) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  const [result, setResult] = useState<ApiResourceResult<T> | null>(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!isBackendConfigured || !enabled) return;

    let active = true;
    const version = refreshVersion;
    fetcherRef.current()
      .then((data) => {
        if (active) setResult({ key, version, status: "api", data });
      })
      .catch((error: unknown) => {
        if (active) setResult({ key, version, status: "error", error: errorMessage(error) });
      });

    return () => {
      active = false;
    };
  }, [enabled, key, refreshVersion]);

  const refresh = useCallback(() => setRefreshVersion((version) => version + 1), []);
  const setData = useCallback(
    (data: T) => setResult({ key, version: refreshVersion, status: "api", data }),
    [key, refreshVersion],
  );
  const currentResult =
    result?.key === key && result.version === refreshVersion
      ? result
      : null;
  const status: ApiResourceStatus = !isBackendConfigured || !enabled
    ? "mock"
    : !currentResult
      ? "loading"
      : currentResult.status;

  return {
    data: currentResult?.status === "api" ? currentResult.data : fallback,
    status,
    error: currentResult?.status === "error" ? currentResult.error : null,
    refresh,
    setData,
  };
}
