"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";

export function SettingsView() {
  const { settings, updateSettings } = useRailTrack();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Control room preferences</h1>
        <p className="mt-1 text-sm text-slate-400">Stored in local React state for this prototype session.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-sm font-medium text-white">Operator profile</h2>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Display name</span>
            <input
              value={settings.operatorName}
              onChange={(event) => updateSettings({ operatorName: event.target.value })}
              className="select-field"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Control room</span>
            <input
              value={settings.controlRoom}
              onChange={(event) => updateSettings({ controlRoom: event.target.value })}
              className="select-field"
            />
          </label>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-medium text-white">Live board</h2>
          <Toggle
            label="Auto-refresh train positions"
            checked={settings.autoRefresh}
            onChange={(checked) => updateSettings({ autoRefresh: checked })}
          />
          <Toggle
            label="Compact train lists"
            checked={settings.compactLists}
            onChange={(checked) => updateSettings({ compactLists: checked })}
          />
          <Toggle
            label="Push delay alerts"
            checked={settings.pushAlerts}
            onChange={(checked) => updateSettings({ pushAlerts: checked })}
          />
          <label className="mt-4 block">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
              Delay threshold ({settings.delayThreshold} min)
            </span>
            <input
              type="range"
              min={5}
              max={60}
              value={settings.delayThreshold}
              onChange={(event) => updateSettings({ delayThreshold: Number(event.target.value) })}
              className="w-full accent-cyan-400"
            />
          </label>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-sm font-medium text-white">Prototype notes</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          RailTrack is a frontend-only command center. Every train, delay and chart uses fictional Indian railway data.
          No live APIs, tickets or operational systems are connected.
        </p>
      </GlassCard>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-1 ${checked ? "bg-cyan-400" : "bg-slate-600"}`}>
        <span className={`size-4 rounded-full bg-slate-950 transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}
