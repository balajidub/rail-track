"use client";

import { DelayFeed } from "@/components/dashboard/DelayFeed";
import { MiniAnalytics } from "@/components/dashboard/MiniAnalytics";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RailwayMap } from "@/components/map/RailwayMap";
import { TrainDetails } from "@/components/trains/TrainDetails";
import { TrainList } from "@/components/trains/TrainList";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";

export function DashboardView() {
  const { setView, settings } = useRailTrack();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Operations overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Railway command dashboard</h1>
          {settings.controlRoom ? <p className="mt-1 text-sm text-slate-400">{settings.controlRoom}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setView("tracking")}
          className="self-start rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Open train map
        </button>
      </div>

      <OverviewCards />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Train locations</p>
              <p className="text-xs text-slate-400">Last reported station from backend records</p>
            </div>
          </div>
          <RailwayMap />
        </GlassCard>
        <GlassCard>
          <p className="mb-4 text-sm font-medium text-white">Delay notifications</p>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <DelayFeed />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard padding={false}>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-medium text-white">Active train list</p>
            <button type="button" className="text-xs text-cyan-300" onClick={() => setView("trains")}>
              View all
            </button>
          </div>
          <TrainList limit={8} />
        </GlassCard>
        <GlassCard padding={false}>
          <TrainDetails />
        </GlassCard>
      </div>

      <GlassCard>
        <MiniAnalytics />
      </GlassCard>
    </div>
  );
}
