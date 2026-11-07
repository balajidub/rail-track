"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { trainsAtStation } from "@/lib/utils";
import { useMemo, useState } from "react";

export function StationsView() {
  const { stations, trains, selectTrain, setView } = useRailTrack();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return stations.filter((station) => {
      if (!value) return true;
      return [station.name, station.code, station.city, station.state, station.zone]
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [stations, query]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Stations</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Junction directory</h1>
        <p className="mt-1 text-sm text-slate-400">Fictional control nodes with live mock occupancy.</p>
      </div>

      <GlassCard>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by city, code or zone"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
        />
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((station) => {
          const nearby = trainsAtStation(trains, station.id);
          return (
            <GlassCard key={station.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-cyan-300">{station.code}</p>
                  <h2 className="text-lg font-semibold text-white">{station.name}</h2>
                  <p className="text-sm text-slate-400">
                    {station.city}, {station.state}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-400">
                  {station.zone}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                <Stat label="Platforms" value={String(station.platforms)} />
                <Stat label="Elevation" value={`${station.elevationM}m`} />
                <Stat label="Nearby" value={String(nearby.length)} />
              </div>
              <div className="mt-4 space-y-2">
                {nearby.length === 0 ? (
                  <p className="text-xs text-slate-500">No mock services currently at this node.</p>
                ) : (
                  nearby.slice(0, 3).map((train) => (
                    <button
                      key={train.id}
                      type="button"
                      onClick={() => {
                        selectTrain(train.id);
                        setView("tracking");
                      }}
                      className="flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-left"
                    >
                      <span className="text-sm text-slate-200">
                        {train.number} {train.name}
                      </span>
                      <span className="text-[11px] text-cyan-300">{train.speed} km/h</span>
                    </button>
                  ))
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] py-2">
      <p className="text-sm font-medium text-white">{value}</p>
      <p>{label}</p>
    </div>
  );
}
