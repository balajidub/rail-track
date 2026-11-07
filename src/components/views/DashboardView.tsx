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
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">National operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Railway command dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">{settings.controlRoom} · fictional prototype feed</p>
        </div>
        <button
          type="button"
          onClick={() => setView("tracking")}
          className="self-start rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Open live map
        </button>
      </div>

      <OverviewCards />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Live train tracking</p>
              <p className="text-xs text-slate-400">Simulated Indian Railways overlay</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-emerald-300">
              Simulated
            </span>
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
