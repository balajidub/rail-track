"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { stationCongestion } from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import type { CongestionLevel } from "@/types/railway";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const congestionLevels: CongestionLevel[] = ["Low", "Moderate", "High", "Critical"];
const levels: Array<"All" | CongestionLevel> = ["All", ...congestionLevels];
const levelStyles: Record<CongestionLevel, string> = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Moderate: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  High: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  Critical: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};
const heatStyles: Record<CongestionLevel, string> = {
  Low: "border-emerald-400/25 bg-emerald-400/10",
  Moderate: "border-amber-400/25 bg-amber-400/10",
  High: "border-orange-400/30 bg-orange-400/15",
  Critical: "border-rose-400/35 bg-rose-400/20",
};

export function StationIntelligenceView() {
  const { stations, trains } = useRailTrack();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"All" | CongestionLevel>("All");
  const [stationId, setStationId] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<number | null>(null);

  const rows = useMemo(
    () => stations.map((station) => ({ station, congestion: stationCongestion(station, trains) }))
      .sort((a, b) => b.congestion.estimatedPassengers - a.congestion.estimatedPassengers),
    [stations, trains],
  );
  const filtered = rows.filter(({ station, congestion }) =>
    (levelFilter === "All" || congestion.level === levelFilter) &&
    `${station.name} ${station.code} ${station.city} ${station.zone}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected = filtered.find(({ station }) => station.id === stationId) ?? filtered[0] ?? rows[0];
  const selectedPlatform = selected?.congestion.platforms.find((platform) => platform.platform === platformId) ?? selected?.congestion.platforms[0];
  const busiestPlatform = selected?.congestion.platforms.reduce(
    (busiest, platform) => platform.densityPercent > busiest.densityPercent ? platform : busiest,
  );
  const stationHistory = selected?.congestion.platforms.slice(0, 8).map((platform, index) => ({
    platform: `PF ${platform.platform}`,
    morning: Math.max(10, platform.densityPercent - (index * 7 + 11) % 28),
    afternoon: Math.max(12, platform.densityPercent - (index * 5 + 6) % 18),
    current: platform.densityPercent,
  })) ?? [];

  const levelCounts = congestionLevels.map((level) => ({
    level,
    count: rows.filter(({ congestion }) => congestion.level === level).length,
  }));

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">V2 · station intelligence</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Station congestion monitor</h1>
        <p className="mt-1 text-sm text-slate-400">Passenger counts and platform density are deterministic simulation estimates, not actual station measurements.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {levelCounts.map(({ level, count }) => (
          <button key={level} type="button" onClick={() => setLevelFilter(levelFilter === level ? "All" : level)}
            className={cn("rounded-2xl border p-4 text-left", levelStyles[level], levelFilter === level && "ring-2 ring-cyan-300/50")}>
            <span className="text-xs uppercase tracking-wider">{level}</span>
            <span className="mt-2 block text-2xl font-semibold">{count}</span>
            <span className="text-xs opacity-70">simulated stations</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="space-y-3 border-b border-white/5 p-4">
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="select-field" placeholder="Search station, city, code or zone" aria-label="Search stations" />
            <label className="sr-only" htmlFor="congestion-filter">Filter by congestion</label>
            <select id="congestion-filter" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as "All" | CongestionLevel)} className="select-field">
              {levels.map((level) => <option key={level} value={level}>{level === "All" ? "All congestion levels" : level}</option>)}
            </select>
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {filtered.length === 0 ? <p className="p-5 text-sm text-slate-400">No stations match your search.</p> :
              filtered.map(({ station, congestion }) => (
                <button key={station.id} type="button" onClick={() => setStationId(station.id)}
                  className={cn("w-full border-b border-white/5 p-4 text-left hover:bg-white/[0.04]", selected?.station.id === station.id && "bg-cyan-400/[0.07]")}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-mono text-xs text-cyan-300">{station.code} · {station.zone}</p><p className="mt-1 text-sm font-medium text-white">{station.name}</p><p className="text-xs text-slate-500">{station.city}</p></div>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px]", levelStyles[congestion.level])}>{congestion.level}</span>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-400"><span>~{congestion.estimatedPassengers.toLocaleString()} passengers</span><span>{congestion.incomingTrains} inbound · {congestion.outgoingTrains} outbound</span></div>
                </button>
              ))}
          </div>
        </GlassCard>

        {selected ? (
          <div className="space-y-5">
            <GlassCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-mono text-xs text-cyan-300">{selected.station.code} · {selected.station.zone}</p><h2 className="mt-1 text-xl font-semibold text-white">{selected.station.name}</h2><p className="text-sm text-slate-400">{selected.station.city}, {selected.station.state} · {selected.station.platforms} platforms</p></div>
                <span className={cn("rounded-full border px-3 py-1.5 text-xs", levelStyles[selected.congestion.level])}>{selected.congestion.level} estimate</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Metric label="Est. passengers" value={`~${selected.congestion.estimatedPassengers.toLocaleString()}`} />
                <Metric label="Incoming" value={String(selected.congestion.incomingTrains)} />
                <Metric label="Outgoing" value={String(selected.congestion.outgoingTrains)} />
              </div>
              {busiestPlatform && busiestPlatform.level !== "Low" ? (
                <div role="alert" className={cn("mt-4 rounded-xl border p-3 text-sm", levelStyles[busiestPlatform.level])}>
                  <p className="font-medium">Simulated congestion alert · Platform {busiestPlatform.platform}</p>
                  <p className="mt-1 text-xs opacity-80">{busiestPlatform.level} estimate at {busiestPlatform.densityPercent}% density. This alert is generated from deterministic demo data.</p>
                </div>
              ) : null}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium text-white">Platform heatmap</h3><span className="text-[11px] text-slate-500">Select a platform for its simulated density</span></div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {selected.congestion.platforms.map((platform) => (
                    <button key={platform.platform} type="button" aria-pressed={selectedPlatform?.platform === platform.platform} title={`Platform ${platform.platform}: ${platform.level} simulated congestion`} onClick={() => setPlatformId(platform.platform)}
                      className={cn("rounded-xl border p-2 text-center transition hover:brightness-125", heatStyles[platform.level], selectedPlatform?.platform === platform.platform && "ring-2 ring-white/80")}>
                      <p className="text-[11px] text-slate-300">PF {platform.platform}</p><p className="mt-1 text-sm font-semibold text-white">{platform.densityPercent}%</p>
                    </button>
                  ))}
                </div>
                {selectedPlatform ? <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-wrap justify-between gap-2 text-xs"><span className="text-slate-200">Platform {selectedPlatform.platform} · {selectedPlatform.level}</span><span className="text-slate-400">~{selectedPlatform.estimatedPassengers} simulated passengers</span></div>
                  <p className="mt-1 text-[11px] text-slate-500">{selectedPlatform.trainNumbers.length ? `Linked mock train services: ${selectedPlatform.trainNumbers.join(", ")}` : "No mock train services assigned to this platform."}</p>
                </div> : null}
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-400">{congestionLevels.map((level) => <span key={level} className="flex items-center gap-1.5"><i className={cn("size-2 rounded-sm", heatStyles[level])} />{level}</span>)}</div>
              </div>
              <div className="mt-5 h-56">
                <h3 className="mb-2 text-sm font-medium text-white">Illustrative congestion history</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stationHistory}>
                    <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="platform" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0b1428", border: "1px solid rgba(34,211,238,.2)", borderRadius: 12 }} />
                    <Bar dataKey="morning" name="Morning" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="afternoon" name="Afternoon" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="current" name="Current estimate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="text-sm font-medium text-white">Suggested simulation actions</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                <li>• {selected.congestion.level === "Critical" || selected.congestion.level === "High" ? "Prioritize a platform-flow review and consider staggered boarding in this scenario." : "Continue routine platform monitoring in this scenario."}</li>
                <li>• Check the arrival sequence for {selected.congestion.incomingTrains} simulated inbound services.</li>
                <li>• Coordinate station updates with the control desk before any real-world action.</li>
              </ul>
            </GlassCard>
          </div>
        ) : <GlassCard><p className="text-sm text-slate-400">No station data is available.</p></GlassCard>}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}
