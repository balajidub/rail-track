
"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { cn } from "@/lib/utils";
import type { AppView } from "@/types/railway";

import {
  BarChart3,
  LayoutDashboard,
  MapPinned,
  Route,
  Search,
  Settings,
  TrainFront,
  Landmark,
  Radio,
} from "lucide-react";

const items: Array<{
  id: AppView;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tracking", label: "Live Tracking", icon: MapPinned },
  { id: "trains", label: "Find Trains", icon: Search },
  { id: "planner", label: "Journey Planner", icon: Route },
  { id: "stations", label: "Stations", icon: Landmark },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const {
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    trains,
  } = useRailTrack();

  const live = trains.filter(
    (train) =>
      train.status !== "cancelled" &&
      train.status !== "arrived"
  ).length;

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "railtrack-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0B1220] px-5 py-6 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="mb-9 flex items-center gap-3 px-1">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20">
            <TrainFront className="size-6 text-white" />
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight text-slate-100">
              RailTrack
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Operations Center
            </p>
          </div>
        </div>

        {/* Network status */}
        <div className="mb-7 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Radio className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Demo Simulation
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-white">
            {live}
          </p>
          <p className="text-xs text-slate-400">
            Simulated trains in motion
          </p>
        </div>

        {/* Navigation */}
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-cyan-400/10 text-cyan-200 shadow-sm"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px]",
                    active ? "text-cyan-300" : "text-slate-500"
                  )}
                />
                {item.label}

                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold text-slate-200">
            Railway Network
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Educational prototype using simulated railway data.
          </p>
        </div>
      </aside>
    </>
  );
}
