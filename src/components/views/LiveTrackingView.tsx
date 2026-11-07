"use client";

import { RailwayMap } from "@/components/map/RailwayMap";
import { TrainDetails } from "@/components/trains/TrainDetails";
import { TrainList } from "@/components/trains/TrainList";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";

export function LiveTrackingView() {
  const { trains, query, setQuery, statusFilter, setStatusFilter, filteredTrains } = useRailTrack();
  const moving = trains.filter((train) => train.status !== "cancelled").length;
  const statuses = ["all", "on-time", "delayed", "cancelled", "arrived"] as const;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Live tracking</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">National railway map</h1>
        <p className="mt-1 text-sm text-slate-400">
          DEMO SIMULATION · {moving} services plotted with simulated positions and corridors.
        </p>
      </div>

      <GlassCard className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
        <label className="sr-only" htmlFor="tracking-search">Search trains</label>
        <input
          id="tracking-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by train name, number or station"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
        />
        <label className="sr-only" htmlFor="tracking-status">Filter by train status</label>
        <select
          id="tracking-status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(statuses.find((status) => status === event.target.value) ?? "all")
          }
          className="select-field"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All statuses" : status.replace("-", " ")}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400" aria-live="polite">
          {filteredTrains.length} of {trains.length} trains
        </p>
      </GlassCard>

      <GlassCard padding={false} className="overflow-hidden">
        <RailwayMap tall />
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard padding={false}>
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-white">Services on the map</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <TrainList />
          </div>
        </GlassCard>
        <GlassCard padding={false}>
          <TrainDetails />
        </GlassCard>
      </div>
    </div>
  );
}
