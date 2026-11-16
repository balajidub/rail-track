"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const chartColors = ["#22d3ee", "#f59e0b", "#fb7185", "#60a5fa", "#34d399", "#818cf8", "#fbbf24"];

export function AnalyticsView() {
  const { trains } = useRailTrack();
  const statusData = [
    { name: "On time", value: trains.filter((train) => train.status === "on-time").length },
    { name: "Delayed", value: trains.filter((train) => train.status === "delayed").length },
    { name: "Cancelled", value: trains.filter((train) => train.status === "cancelled").length },
    { name: "Arrived", value: trains.filter((train) => train.status === "arrived").length },
  ].filter((item) => item.value > 0);
  const delays = [...trains]
    .filter((train) => train.delayMinutes > 0)
    .sort((a, b) => b.delayMinutes - a.delayMinutes)
    .slice(0, 12)
    .map((train) => ({ train: train.number, minutes: train.delayMinutes }));
  const fleet = Object.entries(
    trains.reduce<Record<string, number>>((acc, train) => {
      acc[train.type] = (acc[train.type] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const onTimeRate = trains.length
    ? Math.round((trains.filter((train) => train.status === "on-time").length / trains.length) * 100)
    : null;
  const averageDelay = trains.length
    ? trains.reduce((total, train) => total + train.delayMinutes, 0) / trains.length
    : null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Analytics</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Network performance</h1>
        <p className="mt-1 text-sm text-slate-400">
          Current backend records only. Historical and hourly trend data are not provided.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Train records" value={String(trains.length)} />
        <Metric label="On-time share" value={onTimeRate === null ? "—" : `${onTimeRate}%`} />
        <Metric label="Average recorded delay" value={averageDelay === null ? "—" : `${averageDelay.toFixed(1)} min`} />
      </div>

      {trains.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-slate-400">No backend train records are available for analytics.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <GlassCard>
            <p className="mb-4 text-sm font-medium text-white">Train status breakdown</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <p className="mb-4 text-sm font-medium text-white">Highest recorded delays · up to 12 trains</p>
            {delays.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={delays} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="train" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={70} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="minutes" name="Delay (minutes)" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No positive delays are recorded in the current backend response.</p>
            )}
          </GlassCard>

          <GlassCard>
            <p className="mb-4 text-sm font-medium text-white">Fleet composition</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fleet} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {fleet.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </GlassCard>
  );
}
