"use client";

import { TrainDetails } from "@/components/trains/TrainDetails";
import { TrainList } from "@/components/trains/TrainList";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { cn } from "@/lib/utils";
import type { TrainStatus } from "@/types/railway";

const statuses: Array<"all" | TrainStatus> = ["all", "on-time", "delayed", "cancelled", "arrived"];
const types = ["all", "Rajdhani", "Shatabdi", "Vande Bharat", "Duronto", "Superfast", "Express", "Mail"];

export function FindTrainsView() {
  const { query, setQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, filteredTrains } =
    useRailTrack();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Find trains</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Search the fictional timetable</h1>
        <p className="mt-1 text-sm text-slate-400">{filteredTrains.length} services match the current query and filters.</p>
      </div>

      <GlassCard>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Train number, name, city or station code"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Chip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              label={status === "all" ? "All statuses" : status.replace("-", " ")}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {types.map((type) => (
            <Chip key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)} label={type} />
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard padding={false}>
          <TrainList />
        </GlassCard>
        <GlassCard padding={false}>
          <TrainDetails />
        </GlassCard>
      </div>
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs capitalize",
        active ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-300",
      )}
    >
      {label}
    </button>
  );
}
