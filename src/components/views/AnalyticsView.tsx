"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { corridorDelays, hourlyTraffic, punctualityTrend } from "@/data/mock";
import { useRailTrack } from "@/context/RailTrackContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0b1428",
  border: "1px solid rgba(34,211,238,0.2)",
  borderRadius: 12,
  color: "#e2e8f0",
};

const pieColors = ["#22d3ee", "#38bdf8", "#60a5fa", "#818cf8", "#34d399", "#fbbf24", "#fb7185"];

export function AnalyticsView() {
  const { trains } = useRailTrack();
  const fleet = Object.entries(
    trains.reduce<Record<string, number>>((acc, train) => {
      acc[train.type] = (acc[train.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const onTimeRate = Math.round(
    (trains.filter((train) => train.status === "on-time").length / trains.length) * 100,
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Analytics</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Network performance</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fictional KPI pack for the command desk. Current on-time share {onTimeRate}%.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard>
          <p className="mb-4 text-sm font-medium text-white">Punctuality trend</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={punctualityTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="onTime" stroke="#22d3ee" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="delayed" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="mb-4 text-sm font-medium text-white">Average delay by corridor</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorDelays} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="corridor"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="minutes" fill="#38bdf8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="mb-4 text-sm font-medium text-white">Hourly traffic mix</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTraffic}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="running" stackId="a" fill="#22d3ee" />
                <Bar dataKey="delayed" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <p className="mb-4 text-sm font-medium text-white">Fleet composition</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleet} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {fleet.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
