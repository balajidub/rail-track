"use client";

import { ApiDataNotice } from "@/components/api/ApiDataNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { railTrackApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useApiResource } from "@/lib/useApiResource";
import type { PredictionRisk } from "@/types/railway";
import { useCallback, useMemo, useState } from "react";

const predictionRisks: PredictionRisk[] = ["Low", "Medium", "High", "Critical"];
const risks: Array<"All" | PredictionRisk> = ["All", ...predictionRisks];

const riskStyles: Record<PredictionRisk, string> = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  High: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  Critical: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export function PredictionsView() {
  const { trains, selectTrain } = useRailTrack();
  const [riskFilter, setRiskFilter] = useState<"All" | PredictionRisk>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchPredictions = useCallback(() => railTrackApi.getPredictions(), []);
  const predictionResource = useApiResource("predictions", fetchPredictions);
  const predictions = useMemo(() => {
    return (predictionResource.data ?? [])
      .flatMap((prediction) => {
        const train = trains.find((item) => item.id === prediction.trainId);
        return train ? [{ train, prediction }] : [];
      })
      .sort((a, b) => b.prediction.riskScore - a.prediction.riskScore);
  }, [predictionResource.data, trains]);
  const filtered = predictions.filter(({ train, prediction }) =>
    (riskFilter === "All" || prediction.risk === riskFilter) &&
    `${train.number} ${train.name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected = filtered.find(({ train }) => train.id === selectedId) ?? filtered[0];

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Delay intelligence</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Delay risk estimates</h1>
        <p className="mt-1 text-sm text-slate-400">Delay risk estimates and arrival outlook across the network.</p>
      </header>
      <ApiDataNotice status={predictionResource.status} error={predictionResource.error} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {predictionRisks.map((risk) => {
          const count = predictions.filter(({ prediction }) => prediction.risk === risk).length;
          return (
            <button
              key={risk}
              type="button"
              onClick={() => setRiskFilter(riskFilter === risk ? "All" : risk)}
              className={cn("rounded-2xl border p-4 text-left transition", riskStyles[risk], riskFilter === risk && "ring-2 ring-cyan-300/50")}
            >
              <span className="text-xs uppercase tracking-wider">{risk} risk</span>
              <span className="mt-2 block text-2xl font-semibold">{count}</span>
              <span className="text-xs opacity-70">risk estimates</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="space-y-3 border-b border-white/5 p-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search train number or name"
              className="select-field"
              aria-label="Search predictions"
            />
            <label className="sr-only" htmlFor="prediction-risk-filter">Filter by prediction risk</label>
            <select
              id="prediction-risk-filter"
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value as "All" | PredictionRisk)}
              className="select-field"
            >
              {risks.map((risk) => <option key={risk} value={risk}>{risk} risk</option>)}
            </select>
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">
                {predictionResource.status === "loading"
                  ? "Loading delay estimates…"
                  : predictionResource.status === "api"
                    ? "No predictions match the current trains and filters."
                    : "No delay estimates are available."}
              </p>
            ) : (
              filtered.map(({ train, prediction }) => (
                <button
                  key={train.id}
                  type="button"
                  onClick={() => { setSelectedId(train.id); selectTrain(train.id); }}
                  className={cn("w-full border-b border-white/5 p-4 text-left transition hover:bg-white/[0.04]", selected?.train.id === train.id && "bg-cyan-400/[0.07]")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-mono text-xs text-cyan-300">{train.number}</p><p className="mt-1 text-sm font-medium text-white">{train.name}</p></div>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px] uppercase", riskStyles[prediction.risk])}>{prediction.risk}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Risk score <b className="text-slate-200">{prediction.riskScore}%</b></span>
                    <span>Est. delay <b className="text-slate-200">{prediction.predictedDelayMinutes} min</b></span>
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        {selected ? (
          <div className="space-y-5">
            <GlassCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-cyan-300">{selected.train.number}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{selected.train.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">Current status: {selected.train.status.replace("-", " ")}</p>
                </div>
                <span className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", riskStyles[selected.prediction.risk])}>
                  {selected.prediction.risk} · {selected.prediction.riskScore}%
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Estimated delay" value={`${selected.prediction.predictedDelayMinutes} min`} />
                <Metric label="Estimated arrival" value={selected.prediction.estimatedArrival} />
                <Metric label="Confidence estimate" value={`${selected.prediction.confidence}%`} />
                <Metric label="Recorded delay" value={`${selected.train.delayMinutes} min`} />
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="text-sm font-medium text-white">Factors and attention</h3>
              <ul className="mt-3 space-y-2">
                {selected.prediction.factors.map((factor) => (
                  <li key={factor} className="flex gap-2 text-sm text-slate-300"><span className="text-amber-300">•</span>{factor}</li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-3 text-sm leading-6 text-slate-300">
                {selected.prediction.recommendation}
              </p>
            </GlassCard>
          </div>
        ) : (
          <GlassCard>
            <p className="text-sm text-slate-400">Prediction details appear when an estimate is available.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
