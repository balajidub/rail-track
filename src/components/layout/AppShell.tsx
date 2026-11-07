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
  const { view } = useRailTrack();

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
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
