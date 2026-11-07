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
  const [fromId, setFromId] = useState("NDLS");
  const [toId, setToId] = useState("BPL");
  const [travelClass, setTravelClass] = useState("EC");
  const [date, setDate] = useState("2026-11-08");
  const [submitted, setSubmitted] = useState(true);

  const results = useMemo(() => {
    if (!submitted) return [] as Train[];
    return journeysBetween(trains, fromId, toId);
  }, [submitted, trains, fromId, toId]);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Journey planner</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Plan a corridor hop</h1>
        <p className="mt-1 text-sm text-slate-400">Results are generated from the mock timetable, not live IRCTC inventory.</p>
      </div>

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Field label="From">
            <select value={fromId} onChange={(event) => setFromId(event.target.value)} className="select-field">
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
            <select value={toId} onChange={(event) => setToId(event.target.value)} className="select-field">
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Travel date">
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="select-field" />
          </Field>
          <Field label="Class">
            <select value={travelClass} onChange={(event) => setTravelClass(event.target.value)} className="select-field">
              <option value="EC">Vande Bharat / EC</option>
              <option value="CC">Chair Car</option>
              <option value="3A">AC 3 Tier</option>
              <option value="2A">AC 2 Tier</option>
              <option value="1A">AC First</option>
              <option value="SL">Sleeper</option>
            </select>
          </Field>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="mt-6 h-11 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-medium text-slate-950"
          >
            Find journeys
          </button>
        </div>
      </GlassCard>

      <div className="space-y-3">
        {results.length === 0 ? (
          <GlassCard>
            <p className="text-sm text-slate-400">No through services on this mock corridor. Try New Delhi to Bhopal or Howrah.</p>
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
                  <span>Class {travelClass}</span>
                  <span>{date}</span>
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
