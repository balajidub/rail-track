"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api";

export type ApiResourceStatus = "idle" | "loading" | "api" | "error";

type ApiResourceResult<T> =
  | { key: string; version: number; status: "api"; data: T }
  | { key: string; version: number; status: "error"; error: string };

export function useApiResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  enabled = true,
) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  const [result, setResult] = useState<ApiResourceResult<T> | null>(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    if (!enabled) return;

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
  const status: ApiResourceStatus = !enabled
    ? "idle"
    : !currentResult
      ? "loading"
      : currentResult.status;

  return {
    data: enabled && currentResult?.status === "api"
      ? currentResult.data
      : null,
    status,
    error: enabled && currentResult?.status === "error"
      ? currentResult.error
      : null,
    refresh,
    setData,
  };
}
