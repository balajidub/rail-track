"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { Activity, Clock, Landmark, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";

export function OverviewCards() {
  const { trains, stations } = useRailTrack();
  const active = trains.filter((train) => train.status !== "cancelled" && train.status !== "arrived").length;
  const onTime = trains.filter((train) => train.status === "on-time").length;
  const delayed = trains.filter((train) => train.status === "delayed").length;

  const cards = [
    { label: "Active Trains", value: active, hint: "On the national grid", icon: Activity, accent: "from-cyan-400/20 to-blue-600/10" },
    { label: "On-Time Trains", value: onTime, hint: "Within charted path", icon: Clock, accent: "from-emerald-400/20 to-cyan-500/10" },
    { label: "Delayed Trains", value: delayed, hint: "Above 15 min lag", icon: TriangleAlert, accent: "from-amber-400/20 to-orange-500/10" },
    { label: "Stations", value: stations.length, hint: "Monitored junctions", icon: Landmark, accent: "from-sky-400/20 to-indigo-500/10" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <GlassCard className={`bg-gradient-to-br ${card.accent}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{card.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{card.hint}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                  <Icon className="size-5 text-cyan-300" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
