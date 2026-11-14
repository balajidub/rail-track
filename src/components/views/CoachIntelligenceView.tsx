"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ApiDataNotice } from "@/components/api/ApiDataNotice";
import { useRailTrack } from "@/context/RailTrackContext";
import { railTrackApi } from "@/lib/api";
import { coachOccupancies } from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import type { CoachOccupancy, CoachOccupancyLevel } from "@/types/railway";
import { useApiResource } from "@/lib/useApiResource";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const coachLevels: CoachOccupancyLevel[] = ["Available", "Moderate", "High", "Overcrowded"];
const levels: Array<"All" | CoachOccupancyLevel> = ["All", ...coachLevels];
const levelStyles: Record<CoachOccupancyLevel, string> = {
  Available: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  Moderate: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  High: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  Overcrowded: "border-rose-400/25 bg-rose-400/10 text-rose-300",
};

export function CoachIntelligenceView() {
  const { trains, selectedTrain, selectTrain } = useRailTrack();
  const [trainId, setTrainId] = useState(selectedTrain?.id ?? trains[0]?.id ?? "");
  const [compareId, setCompareId] = useState("");
  const [coachId, setCoachId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<"All" | CoachOccupancyLevel>("All");
  const [sortDescending, setSortDescending] = useState(true);

  const train = trains.find((item) => item.id === trainId) ?? trains[0];
  const localOccupancy = useMemo(() => train ? coachOccupancies(train) : [], [train]);
  const fetchOccupancy = useCallback(
    () => railTrackApi.getTrainCoaches(train?.id ?? ""),
    [train?.id],
  );
  const occupancyResource = useApiResource(
    `train-coaches:${train?.id ?? "none"}`,
    fetchOccupancy,
    localOccupancy,
    Boolean(train),
  );
  const occupancy = occupancyResource.status === "api" && occupancyResource.data.length > 0
    ? occupancyResource.data
    : localOccupancy;
  const filtered = occupancy.filter((coach) => levelFilter === "All" || coach.level === levelFilter)
    .sort((a, b) => sortDescending ? b.occupancyPercent - a.occupancyPercent : a.occupancyPercent - b.occupancyPercent);
  const selectedCoach = filtered.find((coach) => coach.coach === coachId) ?? occupancy.find((coach) => coach.coach === coachId) ?? filtered[0];
  const comparisonTrain = trains.find((item) => item.id === compareId && item.id !== train?.id)
    ?? trains.find((item) => item.id !== train?.id);
  const comparison = comparisonTrain ? coachOccupancies(comparisonTrain) : [];
  const average = occupancy.length ? Math.round(occupancy.reduce((sum, coach) => sum + coach.occupancyPercent, 0) / occupancy.length) : 0;
  const crowded = occupancy.filter((coach) => coach.level === "Overcrowded").length;
  const chartData = occupancy.slice(0, 12);

  if (!train) return <GlassCard><p className="text-sm text-slate-400">No simulated train data is available.</p></GlassCard>;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">V2 · coach intelligence</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Coach occupancy monitor</h1>
        <p className="mt-1 text-sm text-slate-400">Coach-level percentages are fictional simulation estimates, not booking or passenger records.</p>
      </header>
      <ApiDataNotice status={occupancyResource.status} error={occupancyResource.error} />
      {occupancyResource.status === "api" && occupancyResource.data.length === 0 ? (
        <p role="status" className="text-xs text-slate-500">No backend coach records are seeded for this train; bundled demo estimates are shown.</p>
      ) : null}

      <GlassCard className="grid gap-3 md:grid-cols-2">
        <label><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">Train</span>
          <select value={train.id} onChange={(event) => { setTrainId(event.target.value); setCoachId(null); const found = trains.find((item) => item.id === event.target.value); if (found) selectTrain(found.id); }} className="select-field">
            {trains.map((item) => <option key={item.id} value={item.id}>{item.number} · {item.name}</option>)}
          </select>
        </label>
        <label><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">Compare with another train</span>
          <select value={comparisonTrain?.id ?? ""} onChange={(event) => setCompareId(event.target.value)} className="select-field">
            {trains.filter((item) => item.id !== train.id).map((item) => <option key={item.id} value={item.id}>{item.number} · {item.name}</option>)}
          </select>
        </label>
      </GlassCard>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Average coach estimate" value={`${average}%`} />
        <Summary label="Overcrowded coaches" value={`${crowded} / ${occupancy.length}`} />
        <Summary label="Train-level simulated occupancy" value={`${train.occupancy}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <GlassCard>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-base font-medium text-white">Interactive coach formation</h2><p className="mt-1 text-xs text-slate-400">{train.number} · {train.coaches} simulated coaches · select a coach for details</p></div>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="coach-filter">Filter coaches</label>
                <select id="coach-filter" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as "All" | CoachOccupancyLevel)} className="select-field h-10 w-auto">
                  {levels.map((level) => <option key={level}>{level}</option>)}
                </select>
                <button type="button" onClick={() => setSortDescending((value) => !value)} className="rounded-xl border border-white/10 px-3 text-xs text-slate-300">{sortDescending ? "Most full first" : "Least full first"}</button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {filtered.map((coach) => (
                <CoachButton key={coach.coach} coach={coach} selected={selectedCoach?.coach === coach.coach} onClick={() => setCoachId(coach.coach)} />
              ))}
            </div>
            {filtered.length === 0 ? <p className="mt-4 text-sm text-slate-400">No coaches match this occupancy filter.</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">{coachLevels.map((level) => <span key={level} className={cn("rounded-full border px-2 py-1 text-[10px]", levelStyles[level])}>{level}</span>)}</div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-sm font-medium text-white">Coach occupancy profile</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="coach" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0b1428", border: "1px solid rgba(34,211,238,.2)", borderRadius: 12 }} />
                  <Bar dataKey="occupancyPercent" name="Estimated occupancy %" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {occupancy.length > 12 ? <p className="mt-2 text-[10px] text-slate-500">Chart shows the first 12 coaches; all coaches remain selectable above.</p> : null}
          </GlassCard>
        </div>

        <div className="space-y-5">
          <GlassCard>
            <h2 className="text-base font-medium text-white">Selected coach</h2>
            {selectedCoach ? <CoachDetail coach={selectedCoach} trainName={train.name} /> : <p className="mt-3 text-sm text-slate-400">No coaches match the selected filter.</p>}
          </GlassCard>
          <GlassCard>
            <h2 className="text-sm font-medium text-white">Train comparison</h2>
            {comparisonTrain ? (
              <>
                <p className="mt-1 text-xs text-slate-400">{train.number} vs {comparisonTrain.number}</p>
                <div className="mt-4 space-y-4">
                  <CompareBar label={train.name} value={average} color="bg-cyan-400" />
                  <CompareBar label={comparisonTrain.name} value={Math.round(comparison.reduce((sum, coach) => sum + coach.occupancyPercent, 0) / comparison.length)} color="bg-blue-400" />
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">Side-by-side mock estimates only. No ticketing or reservation data is used.</p>
              </>
            ) : <p className="mt-3 text-sm text-slate-400">Add another train to compare estimates.</p>}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function CoachButton({ coach, selected, onClick }: { coach: CoachOccupancy; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={cn("rounded-xl border p-3 text-left transition hover:brightness-125", levelStyles[coach.level], selected && "ring-2 ring-white/80")}>
    <span className="block text-xs font-semibold">{coach.coach}</span><span className="mt-1 block text-lg font-bold">{coach.occupancyPercent}%</span><span className="block text-[9px] opacity-70">{coach.level}</span>
  </button>;
}

function CoachDetail({ coach, trainName }: { coach: CoachOccupancy; trainName: string }) {
  return <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="flex items-start justify-between"><div><p className="font-mono text-cyan-300">{coach.coach}</p><p className="mt-1 text-sm text-slate-400">{trainName}</p></div><span className={cn("rounded-full border px-2 py-1 text-[10px]", levelStyles[coach.level])}>{coach.level}</span></div>
    <p className="mt-5 text-4xl font-semibold text-white">{coach.occupancyPercent}<span className="text-lg text-slate-500">%</span></p>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full", coach.level === "Overcrowded" ? "bg-rose-400" : coach.level === "High" ? "bg-amber-400" : coach.level === "Moderate" ? "bg-sky-400" : "bg-emerald-400")} style={{ width: `${coach.occupancyPercent}%` }} /></div>
    <p className="mt-4 text-xs leading-5 text-slate-400">Illustrative coach loading estimate generated from the train-level mock occupancy. Not actual passenger counts.</p>
  </div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <GlassCard><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></GlassCard>;
}

function CompareBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className="mb-2 flex justify-between gap-2 text-xs"><span className="truncate text-slate-300">{label}</span><span className="text-white">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} /></div></div>;
}
