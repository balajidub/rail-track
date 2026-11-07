"use client";

import { hourlyTraffic, punctualityTrend } from "@/data/mock";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

export function MiniAnalytics() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="h-56">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Punctuality · 7 days</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={punctualityTrend}>
            <defs>
              <linearGradient id="onTimeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="onTime" stroke="#22d3ee" fill="url(#onTimeFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-56">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Grid load by hour</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyTraffic}>
            <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="running" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="delayed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
