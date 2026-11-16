"use client";

import { ApiDataNotice } from "@/components/api/ApiDataNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { railTrackApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CongestionLevel, PlatformCongestion, StationCongestion } from "@/types/railway";
import { useApiResource } from "@/lib/useApiResource";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const congestionLevels: CongestionLevel[] = ["Low", "Moderate", "High", "Critical"];
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
  const { stations } = useRailTrack();
  const [query, setQuery] = useState("");
  const [stationId, setStationId] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<number | null>(null);

  const filteredStations = stations.filter((station) =>
    `${station.name} ${station.code} ${station.city} ${station.zone}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const selected = filteredStations.find((station) => station.id === stationId) ?? filteredStations[0];
  const selectedStationId = selected?.id ?? "";
  const congestionResource = useApiResource(
    `station-congestion:${selectedStationId || "none"}`,
    () => railTrackApi.getStationCongestion(selectedStationId),
    Boolean(selected),
  );
  const selectedCongestion = congestionResource.data?.stationId === selectedStationId
    ? congestionResource.data
    : null;
  const historyResource = useApiResource(
    `station-congestion-history:${selectedStationId || "none"}`,
    () => railTrackApi.getStationCongestionHistory(selectedStationId, 12),
    Boolean(selected),
  );
  const history = historyResource.data ?? [];
  const apiHistory = history
    .filter((snapshot): snapshot is StationCongestion & { recordedAt: string } => Boolean(snapshot.recordedAt))
    .slice(0, 8)
    .reverse()
    .flatMap((snapshot) => {
      const activityScore = snapshot.activityScore
        ?? (snapshot.platforms.length
          ? snapshot.platforms.reduce((total, platform) => total + platform.densityPercent, 0) / snapshot.platforms.length
          : null);
      return activityScore === null
        ? []
        : [{
            time: new Date(snapshot.recordedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            activityScore,
          }];
    });
  const selectedPlatform = selectedCongestion?.platforms.find((platform) => platform.platform === platformId)
    ?? selectedCongestion?.platforms[0];
  const busiestPlatform = selectedCongestion?.platforms.reduce<PlatformCongestion | null>(
    (busiest, platform) => !busiest || platform.densityPercent > busiest.densityPercent ? platform : busiest,
    null,
  ) ?? null;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Station intelligence</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Station congestion monitor</h1>
        <p className="mt-1 text-sm text-slate-400">Station activity and platform utilization across the network.</p>
      </header>

      {selected ? (
        <div className="space-y-2">
          <ApiDataNotice status={congestionResource.status} error={congestionResource.error} />
          <ApiDataNotice status={historyResource.status} error={historyResource.error} />
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="border-b border-white/5 p-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="select-field"
              placeholder="Search station, city, code or zone"
              aria-label="Search stations"
            />
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {filteredStations.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">
                {stations.length === 0 ? "No stations are available." : "No stations match your search."}
              </p>
            ) : (
              filteredStations.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => { setStationId(station.id); setPlatformId(null); }}
                  className={cn("w-full border-b border-white/5 p-4 text-left hover:bg-white/[0.04]", selected?.id === station.id && "bg-cyan-400/[0.07]")}
                >
                  <p className="font-mono text-xs text-cyan-300">{station.code} · {station.zone}</p>
                  <p className="mt-1 text-sm font-medium text-white">{station.name}</p>
                  <p className="text-xs text-slate-500">{station.city} · {station.platforms} platforms</p>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        {selected ? (
          <div className="space-y-5">
            <GlassCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-cyan-300">{selected.code} · {selected.zone}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{selected.name}</h2>
                  <p className="text-sm text-slate-400">{selected.city}, {selected.state} · {selected.platforms} platforms</p>
                </div>
                {selectedCongestion ? (
                  <span className={cn("rounded-full border px-3 py-1.5 text-xs", levelStyles[selectedCongestion.level])}>
                    {selectedCongestion.level} estimate
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Metric label="Estimated passengers" value={selectedCongestion ? `~${selectedCongestion.estimatedPassengers.toLocaleString()}` : "—"} />
                <Metric label="Incoming trains" value={selectedCongestion ? String(selectedCongestion.incomingTrains) : "—"} />
                <Metric label="Outgoing trains" value={selectedCongestion ? String(selectedCongestion.outgoingTrains) : "—"} />
              </div>

              {congestionResource.status === "api" && !selectedCongestion ? (
                <p className="mt-4 text-sm text-slate-400">No congestion record was returned for this station.</p>
              ) : null}

              {busiestPlatform && busiestPlatform.level !== "Low" ? (
                <div role="note" className={cn("mt-4 rounded-xl border p-3 text-sm", levelStyles[busiestPlatform.level])}>
                  <p className="font-medium">Platform {busiestPlatform.platform} · {busiestPlatform.level}</p>
                  <p className="mt-1 text-xs opacity-80">Estimated utilization: {busiestPlatform.densityPercent}%.</p>
                </div>
              ) : null}

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Platform estimates</h3>
                  <span className="text-[11px] text-slate-500">Platform utilization</span>
                </div>
                {selectedCongestion?.platforms.length ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {selectedCongestion.platforms.map((platform) => (
                      <button
                        key={platform.platform}
                        type="button"
                        aria-pressed={selectedPlatform?.platform === platform.platform}
                        title={`Platform ${platform.platform}: ${platform.densityPercent}% utilization`}
                        onClick={() => setPlatformId(platform.platform)}
                        className={cn("rounded-xl border p-2 text-center transition hover:brightness-125", heatStyles[platform.level], selectedPlatform?.platform === platform.platform && "ring-2 ring-white/80")}
                      >
                        <p className="text-[11px] text-slate-300">PF {platform.platform}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{platform.densityPercent}%</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No platform congestion records are available.</p>
                )}
                {selectedPlatform ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex flex-wrap justify-between gap-2 text-xs">
                      <span className="text-slate-200">Platform {selectedPlatform.platform} · {selectedPlatform.level}</span>
                      <span className="text-slate-400">Estimated passengers: {selectedPlatform.estimatedPassengers}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Connected services: {selectedPlatform.trainNumbers.length ? selectedPlatform.trainNumbers.join(", ") : "none"}
                    </p>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-400">
                  {congestionLevels.map((level) => (
                    <span key={level} className="flex items-center gap-1.5">
                      <i className={cn("size-2 rounded-sm", heatStyles[level])} />{level}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-medium text-white">Station activity history</h3>
              {historyResource.status === "api" && apiHistory.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No historical snapshots are recorded for this station.</p>
              ) : apiHistory.length ? (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apiHistory}>
                      <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b1428", border: "1px solid rgba(34,211,238,.2)", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="activityScore" name="Activity estimate" stroke="#22d3ee" strokeWidth={2} dot={{ fill: "#22d3ee", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                Passenger counts and platform density are estimates.
              </p>
            </GlassCard>
          </div>
        ) : (
          <GlassCard>
            <p className="text-sm text-slate-400">Select a station to view its activity details.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
