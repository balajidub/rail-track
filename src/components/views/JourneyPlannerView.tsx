"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRailTrack } from "@/context/RailTrackContext";
import { etaForTrain, formatDelay, journeysBetween, stationById } from "@/lib/utils";
import type { Train } from "@/types/railway";
import { ArrowRightLeft } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export function JourneyPlannerView() {
  const { stations, trains, selectTrain, setView } = useRailTrack();
  const [fromSelection, setFromSelection] = useState("");
  const [toSelection, setToSelection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fromId = stations.some((station) => station.id === fromSelection)
    ? fromSelection
    : stations[0]?.id ?? "";
  const toId = stations.some((station) => station.id === toSelection)
    ? toSelection
    : stations[1]?.id ?? stations[0]?.id ?? "";

  const results = useMemo(() => {
    if (!submitted) return [] as Train[];
    return journeysBetween(trains, fromId, toId);
  }, [submitted, trains, fromId, toId]);

  const swap = () => {
    setFromSelection(toId);
    setToSelection(fromId);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Journey planner</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Plan a corridor hop</h1>
        <p className="mt-1 text-sm text-slate-400">Search scheduled stops in backend train records. Ticket availability is not provided.</p>
      </div>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Field label="From">
            <select value={fromId} onChange={(event) => setFromSelection(event.target.value)} className="select-field">
              <option value="" disabled>Select station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={swap}
            className="mt-6 flex size-11 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 text-cyan-300"
            aria-label="Swap stations"
          >
            <ArrowRightLeft className="size-4" />
          </button>
          <Field label="To">
            <select value={toId} onChange={(event) => setToSelection(event.target.value)} className="select-field">
              <option value="" disabled>Select station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!fromId || !toId || fromId === toId}
            className="h-11 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find journeys
          </button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {results.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-slate-400">
              {!stations.length
                ? "No backend station records are available."
                : !trains.length
                  ? "No backend train schedule records are available."
                  : submitted
                    ? "No backend train record connects these stations in this direction."
                    : "Choose two stations to search the available backend schedules."}
            </p>
          </GlassCard>
        ) : (
          results.map((train) => {
            const originStop = train.stops.find((stop) => stop.stationId === fromId);
            const destStop = train.stops.find((stop) => stop.stationId === toId);
            const fromStation = stationById(stations, fromId);
            const toStation = stationById(stations, toId);
            return (
              <button
                key={train.id}
                type="button"
                onClick={() => {
                  selectTrain(train.id);
                  setView("tracking");
                }}
                className="glass-panel w-full rounded-2xl p-5 text-left transition hover:border-cyan-400/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-cyan-300">{train.number}</p>
                    <p className="text-lg font-semibold text-white">{train.name}</p>
                    <p className="text-sm text-slate-400">
                      {fromStation?.name} {originStop?.departure ?? originStop?.arrival} → {toStation?.name}{" "}
                      {destStop?.arrival ?? destStop?.departure}
                    </p>
                  </div>
                  <StatusBadge status={train.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                  <span>{train.type}</span>
                  <span>ETA {etaForTrain(train)}</span>
                  <span>{formatDelay(train.delayMinutes)}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
