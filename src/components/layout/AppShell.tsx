"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { DashboardView } from "@/components/views/DashboardView";
import { LiveTrackingView } from "@/components/views/LiveTrackingView";
import { FindTrainsView } from "@/components/views/FindTrainsView";
import { JourneyPlannerView } from "@/components/views/JourneyPlannerView";
import { StationsView } from "@/components/views/StationsView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { SettingsView } from "@/components/views/SettingsView";
import { PredictionsView } from "@/components/views/PredictionsView";
import { StationIntelligenceView } from "@/components/views/StationIntelligenceView";
import { IncidentCenterView } from "@/components/views/IncidentCenterView";
import { CoachIntelligenceView } from "@/components/views/CoachIntelligenceView";
import { RouteOptimizationView } from "@/components/views/RouteOptimizationView";

export function AppShell() {
  const { view, backendStatus, backendError, refreshApiData } = useRailTrack();
  const statusText = {
    mock: "DEMO SIMULATION · Using bundled fictional sample data.",
    loading: "DEMO SIMULATION · Connecting to the configured backend; sample data remains visible.",
    connected: "DEMO SIMULATION · Backend connected. No live railway systems are used.",
    partial: `DEMO SIMULATION · Some backend requests failed; affected screens use sample data. ${backendError ?? ""}`,
    unavailable: `DEMO SIMULATION · Backend unavailable; using bundled sample data. ${backendError ?? ""}`,
  }[backendStatus];
  const statusStyle =
    backendStatus === "connected"
      ? "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-200"
      : backendStatus === "partial" || backendStatus === "unavailable"
        ? "border-amber-400/20 bg-amber-400/[0.05] text-amber-200"
        : "border-white/10 bg-white/[0.03] text-slate-400";

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
          <div
            role={backendStatus === "partial" || backendStatus === "unavailable" ? "alert" : "status"}
            aria-live="polite"
            className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${statusStyle}`}
          >
            <span>{statusText}</span>
            {backendStatus === "partial" || backendStatus === "unavailable" ? (
              <button type="button" onClick={() => void refreshApiData()} className="underline underline-offset-2">
                Retry backend
              </button>
            ) : null}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {view === "dashboard" ? <DashboardView /> : null}
              {view === "tracking" ? <LiveTrackingView /> : null}
              {view === "trains" ? <FindTrainsView /> : null}
              {view === "planner" ? <JourneyPlannerView /> : null}
              {view === "stations" ? <StationsView /> : null}
              {view === "analytics" ? <AnalyticsView /> : null}
              {view === "predictions" ? <PredictionsView /> : null}
              {view === "station-intelligence" ? <StationIntelligenceView /> : null}
              {view === "incidents" ? <IncidentCenterView /> : null}
              {view === "coaches" ? <CoachIntelligenceView /> : null}
              {view === "route-optimization" ? <RouteOptimizationView /> : null}
              {view === "settings" ? <SettingsView /> : null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
