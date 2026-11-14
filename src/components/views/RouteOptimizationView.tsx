"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ApiDataNotice } from "@/components/api/ApiDataNotice";
import { useRailTrack } from "@/context/RailTrackContext";
import { railTrackApi } from "@/lib/api";
import { optimizeRoute } from "@/lib/intelligence";
import { cn, stationById } from "@/lib/utils";
import { useApiResource } from "@/lib/useApiResource";
import { useCallback, useMemo, useState } from "react";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
}

export function RouteOptimizationView() {
  const { trains, stations, selectedTrain, selectTrain } = useRailTrack();
  const [trainId, setTrainId] = useState(selectedTrain?.id ?? trains[0]?.id ?? "");
  const [routeId, setRouteId] = useState<string | null>(null);
  const train = trains.find((item) => item.id === trainId) ?? trains[0];
  const localRoutes = useMemo(() => train ? optimizeRoute(train, trains) : [], [train, trains]);
  const fallbackComparison = useMemo(
    () => ({
      trainId: train?.id ?? "",
      alternatives: localRoutes,
      notice: "Illustrative alternatives are not officially approved railway routes or dispatch guidance.",
    }),
    [localRoutes, train?.id],
  );
  const fetchComparison = useCallback(
    () => railTrackApi.compareRoutes(train?.id ?? ""),
    [train?.id],
  );
  const routeResource = useApiResource(
    `route-comparison:${train?.id ?? "none"}`,
    fetchComparison,
    fallbackComparison,
    Boolean(train),
  );
  const routes = routeResource.status === "api" ? routeResource.data.alternatives : localRoutes;
  const selectedRoute = routes.find((route) => route.id === routeId) ?? routes.find((route) => route.recommended) ?? routes[0];
  const longest = routes.length ? Math.max(...routes.map((route) => route.durationMinutes)) : 1;
  const stops = train?.stops.map((stop) => stationById(stations, stop.stationId)).filter((station) => station !== undefined) ?? [];
  const waypoint = selectedRoute?.waypointId ? stationById(stations, selectedRoute.waypointId) : undefined;

  if (!train) return <GlassCard><p className="text-sm text-slate-400">No simulated train data is available.</p></GlassCard>;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">V2 · route intelligence</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Route scenario optimizer</h1>
        <p className="mt-1 text-sm text-slate-400">Compares illustrative alternatives from mock data. These routes are not verified, approved, or available for railway operations.</p>
      </header>
      <ApiDataNotice status={routeResource.status} error={routeResource.error} />
      {routeResource.status === "api" ? (
        <p role="note" className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-xs text-amber-200">
          {routeResource.data.notice}
        </p>
      ) : null}

      <GlassCard className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">Train corridor</span>
          <select value={train.id} onChange={(event) => { setTrainId(event.target.value); setRouteId(null); const item = trains.find((candidate) => candidate.id === event.target.value); if (item) selectTrain(item.id); }} className="select-field">
            {trains.map((item) => <option key={item.id} value={item.id}>{item.number} · {item.name}</option>)}
          </select>
        </label>
        <p className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-xs leading-5 text-amber-200/80">Decision-support demonstration only — never use as dispatch guidance.</p>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <GlassCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-mono text-xs text-cyan-300">{train.number}</p><h2 className="mt-1 text-lg font-semibold text-white">{train.name}</h2><p className="text-sm text-slate-400">{stationById(stations, train.from)?.name} → {stationById(stations, train.to)?.name}</p></div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{train.stops.length} listed stops</span>
            </div>
            <div className="mt-5 space-y-3">
              {routes.length === 0 ? <p className="text-sm text-slate-400">No route alternatives are available for this train in the current demo graph.</p> : null}
              {routes.map((route) => {
                const total = route.durationMinutes + route.predictedDelayMinutes;
                const width = Math.max(12, Math.round(total / Math.max(longest + Math.max(...routes.map((item) => item.predictedDelayMinutes)), 1) * 100));
                const active = selectedRoute?.id === route.id;
                return (
                  <button key={route.id} type="button" onClick={() => setRouteId(route.id)} aria-pressed={active}
                    className={cn("w-full rounded-2xl border p-4 text-left transition", active ? "border-cyan-300/30 bg-cyan-300/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]")}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><h3 className="text-sm font-medium text-white">{route.label}</h3>{route.recommended ? <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] uppercase tracking-wide text-emerald-300">Recommended scenario</span> : null}</div>
                      <span className="text-xs text-slate-400">{formatDuration(route.durationMinutes)} + {route.predictedDelayMinutes}m delay</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full transition-all", route.recommended ? "bg-emerald-400" : "bg-cyan-400")} style={{ width: `${width}%` }} /></div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400"><span>{route.affectedStations} stations in scenario</span><span>{route.affectedTrains.length} connecting services intersect</span><span>Total estimated {formatDuration(total)}</span></div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-sm font-medium text-white">Current listed corridor</h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {stops.map((station, index) => (
                <span key={`${station.id}-${index}`} className="flex items-center gap-2">
                  <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-200">{station.code}</span>
                  {index < stops.length - 1 ? <span className="text-cyan-400">→</span> : null}
                </span>
              ))}
            </div>
            {selectedRoute?.waypointId && waypoint ? (
              <div className="mt-4 rounded-xl border border-blue-400/15 bg-blue-400/[0.04] p-3">
                <p className="text-xs uppercase tracking-wider text-blue-300">Illustrative waypoint</p>
                <p className="mt-1 text-sm text-white">{stationById(stations, train.from)?.code} → {waypoint.code} ({waypoint.name}) → {stationById(stations, train.to)?.code}</p>
                <p className="mt-1 text-[11px] text-slate-500">A conceptual comparison only; track connectivity and operational feasibility are not modeled.</p>
              </div>
            ) : null}
          </GlassCard>
        </div>

        {selectedRoute ? (
          <div className="space-y-5">
            <GlassCard>
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-cyan-300">Selected scenario</p><h2 className="mt-1 text-xl font-semibold text-white">{selectedRoute.label}</h2></div><span className={cn("rounded-full border px-2.5 py-1 text-xs", selectedRoute.recommended ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-slate-300")}>{selectedRoute.recommended ? "Best simulated score" : "Comparison"}</span></div>
              <p className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.05] px-3 py-2 text-xs text-rose-200">
                {selectedRoute.officiallyApproved ? "Official approval status is asserted by the API." : "NOT OFFICIALLY APPROVED · simulation comparison only."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="Estimated journey" value={formatDuration(selectedRoute.durationMinutes)} />
                <Metric label="Predicted delay" value={`${selectedRoute.predictedDelayMinutes} min`} />
                <Metric label="Stations affected" value={String(selectedRoute.affectedStations)} />
                <Metric label="Connecting trains" value={String(selectedRoute.affectedTrains.length)} />
              </div>
              <div className="mt-5 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
                <p className="text-xs uppercase tracking-wider text-cyan-200">Why this comparison</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedRoute.rationale}</p>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Recommendation is selected by a transparent demonstration score combining journey duration, simulated delay, and intersecting mock services. It is not a real route-planning or dispatch algorithm.</p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-sm font-medium text-white">Potential connecting services</h2>
              {selectedRoute.affectedTrains.length ? (
                <div className="mt-3 flex flex-wrap gap-2">{selectedRoute.affectedTrains.map((number) => <span key={number} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs text-slate-300">{number}</span>)}</div>
              ) : <p className="mt-3 text-sm text-slate-400">No intersecting mock services identified for this scenario.</p>}
              <p className="mt-3 text-[11px] leading-5 text-slate-500">Intersecting services share at least one listed station; connection timing and actual interchange feasibility are not modeled.</p>
            </GlassCard>

            <GlassCard>
              <h2 className="text-sm font-medium text-white">Scenario comparison</h2>
              <div className="mt-4 space-y-3">{routes.map((route) => <div key={route.id}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-300">{route.label}</span><span className="shrink-0 text-slate-400">{formatDuration(route.durationMinutes + route.predictedDelayMinutes)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full", route.recommended ? "bg-emerald-400" : "bg-blue-400")} style={{ width: `${Math.max(8, Math.round((route.durationMinutes + route.predictedDelayMinutes) / Math.max(longest + Math.max(...routes.map((item) => item.predictedDelayMinutes)), 1) * 100))}%` }} /></div></div>)}</div>
              <p className="mt-3 text-[10px] text-slate-500">Scale represents relative duration within these fictional scenarios.</p>
            </GlassCard>
          </div>
        ) : <GlassCard><p className="text-sm text-slate-400">No route scenarios are available.</p></GlassCard>}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}
