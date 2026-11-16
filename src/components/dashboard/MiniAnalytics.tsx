"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRailTrack } from "@/context/RailTrackContext";
import { errorMessage, railTrackApi, type TrainSummaryResponse } from "@/lib/api";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0b1428",
  border: "1px solid rgba(34,211,238,0.2)",
  borderRadius: 12,
  color: "#e2e8f0",
};

export function MiniAnalytics() {
  const { settings } = useRailTrack();
  const [summary, setSummary] = useState<TrainSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedLoad = useRef(false);
  const delayData = summary?.trains.map((train) => ({
    train: train.number,
    minutes: train.delayMinutes,
  })) ?? [];

  const refreshSummary = useCallback(async () => {
    const isInitialLoad = !hasAttemptedLoad.current;
    hasAttemptedLoad.current = true;
    setIsLoading(isInitialLoad);
    setIsRefreshing(!isInitialLoad);
    setError(null);

    try {
      setSummary(await railTrackApi.getTrainSummary());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => {
      void refreshSummary();
    }, 0);
    if (!settings.autoRefresh) {
      return () => window.clearTimeout(initialLoadId);
    }

    const intervalId = window.setInterval(() => {
      void refreshSummary();
    }, 10_000);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [refreshSummary, settings.autoRefresh]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-cyan-400/10 bg-[#08101f]/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Train service summary</p>
            <p className="mt-1 text-xs text-slate-400">
              {settings.autoRefresh ? "Refreshes every 10 seconds" : "Manual refresh"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshSummary()}
            disabled={isLoading || isRefreshing}
            className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-200 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading…" : isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-xs text-amber-200">
            {error}{summary ? " Showing the last successful response." : ""}
          </p>
        ) : null}

        {isLoading ? (
          <p role="status" className="mt-4 text-sm text-slate-400">Loading train summary…</p>
        ) : summary ? (
          <>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="Valid trains"
                value={`${summary.validTrains} / ${summary.totalTrains}`}
                detail={`${summary.invalidTrains} invalid records`}
              />
              <SummaryMetric
                label="Train status"
                value={`${summary.onTimeTrains} on time · ${summary.delayedTrains} delayed`}
                detail={`${summary.cancelledTrains} cancelled · ${summary.arrivedTrains} arrived`}
              />
              <SummaryMetric
                label="Total delay"
                value={`${summary.totalDelayMinutes} min`}
                detail={`Average ${summary.averageDelayMinutes.toFixed(1)} min`}
              />
              <SummaryMetric
                label="Maximum delay"
                value={`${summary.maximumDelayMinutes} min`}
                detail="Across valid train records"
              />
            </div>

            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                Per-train status
              </p>
              {summary.trains.length ? (
                <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {summary.trains.map((train) => (
                    <li
                      key={train.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-white/[0.03] px-3 py-2"
                    >
                      <div>
                        <p className="text-sm text-slate-200">
                          {train.number} · {train.name}
                        </p>
                        <p className="text-xs text-slate-400">{train.summary}</p>
                      </div>
                      <span className="text-xs capitalize text-cyan-200">{train.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No valid train records are available.</p>
              )}
            </div>
          </>
        ) : null}
      </section>

      {summary ? (
        <div className="h-56">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Recorded delay by train</p>
          {delayData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData}>
                <XAxis dataKey="train" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="minutes" name="Delay (minutes)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">No valid train records were returned for this summary.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
