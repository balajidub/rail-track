"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRailTrack } from "@/context/RailTrackContext";
import { cn, etaForTrain, formatDelay, stationById } from "@/lib/utils";
import { Clock3, Gauge, MapPin, Users } from "lucide-react";

export function TrainDetails() {
  const { selectedTrain, stations } = useRailTrack();

  if (!selectedTrain) {
    return <p className="p-6 text-sm text-slate-400">Select a train to inspect route, platform and ETA.</p>;
  }

  const origin = stationById(stations, selectedTrain.from);
  const destination = stationById(stations, selectedTrain.to);
  const current = stationById(stations, selectedTrain.currentStationId);
  const next = stationById(stations, selectedTrain.nextStationId);

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-cyan-300">{selectedTrain.number}</p>
          <h3 className="text-xl font-semibold text-white">{selectedTrain.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {origin?.name} → {destination?.name}
          </p>
        </div>
        <StatusBadge status={selectedTrain.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Gauge} label="Speed" value={`${selectedTrain.speed} km/h`} />
        <Metric icon={Clock3} label="ETA" value={etaForTrain(selectedTrain)} />
        <Metric icon={MapPin} label="Platform" value={`PF ${selectedTrain.platform}`} />
        <Metric icon={Users} label="Occupancy" value={`${selectedTrain.occupancy}%`} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
        <p className="text-slate-400">
          Near <span className="text-white">{current?.name}</span> · next{" "}
          <span className="text-white">{next?.name}</span>
        </p>
        <p className="mt-1 text-amber-300">{formatDelay(selectedTrain.delayMinutes)}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{ width: `${Math.round(selectedTrain.progress * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {Math.round(selectedTrain.progress * 100)}% of {selectedTrain.distanceKm} km · {selectedTrain.coaches} coaches
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Route stops</p>
        <ol className="space-y-0">
          {selectedTrain.stops.map((stop, index) => {
            const station = stationById(stations, stop.stationId);
            const active = stop.stationId === selectedTrain.currentStationId;
            return (
              <li key={`${stop.stationId}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 size-2.5 rounded-full",
                      active ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-slate-500",
                    )}
                  />
                  {index < selectedTrain.stops.length - 1 ? (
                    <span className="h-10 w-px bg-white/10" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", active ? "text-cyan-200" : "text-slate-200")}>
                      {station?.name}
                    </p>
                    <p className="text-xs text-slate-500">PF {stop.platform}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {stop.arrival ?? "Origin"} → {stop.departure ?? "Terminus"} · {stop.distanceKm} km
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
        <Icon className="size-3.5 text-cyan-300" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
