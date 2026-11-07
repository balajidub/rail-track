"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRailTrack } from "@/context/RailTrackContext";
import { cn, formatDelay } from "@/lib/utils";

export function TrainList({ limit }: { limit?: number }) {
  const { filteredTrains, selectedTrainId, selectTrain, settings } = useRailTrack();
  const rows = limit ? filteredTrains.slice(0, limit) : filteredTrains;

  if (rows.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-slate-400">No trains match the current filters.</p>;
  }

  return (
    <div className="divide-y divide-white/5">
      {rows.map((train) => (
        <button
          key={train.id}
          type="button"
          onClick={() => selectTrain(train.id)}
          className={cn(
            "flex w-full items-center gap-4 px-4 text-left transition-colors hover:bg-cyan-400/5",
            settings.compactLists ? "py-2.5" : "py-3.5",
            selectedTrainId === train.id && "bg-cyan-400/10",
          )}
        >
          <div className="w-16 shrink-0 font-mono text-sm text-cyan-300">{train.number}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{train.name}</p>
            <p className="truncate text-xs text-slate-400">
              {train.from} → {train.to}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm text-slate-200">{train.departure}</p>
            <p className="text-[11px] text-slate-500">dep</p>
          </div>
          <div className="hidden text-right md:block">
            <p className="text-sm text-slate-200">{train.arrival}</p>
            <p className="text-[11px] text-slate-500">arr</p>
          </div>
          <div className="hidden w-20 text-right text-xs text-amber-300 lg:block">
            {formatDelay(train.delayMinutes)}
          </div>
          <StatusBadge status={train.status} compact />
        </button>
      ))}
    </div>
  );
}
