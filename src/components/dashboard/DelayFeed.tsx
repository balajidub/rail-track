"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { cn } from "@/lib/utils";

export function DelayFeed() {
  const { alerts, markAlertRead, selectTrain, setView } = useRailTrack();

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => {
            markAlertRead(alert.id);
            selectTrain(alert.trainId);
            setView("tracking");
          }}
          className={cn(
            "w-full rounded-2xl border px-4 py-3 text-left transition hover:bg-white/5",
            alert.severity === "critical"
              ? "border-rose-400/20 bg-rose-400/5"
              : alert.severity === "warning"
                ? "border-amber-400/20 bg-amber-400/5"
                : "border-cyan-400/15 bg-cyan-400/5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">{alert.title}</p>
            <p className="text-[11px] text-slate-500">{alert.time}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-400">{alert.message}</p>
        </button>
      ))}
    </div>
  );
}
