"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ApiDataNotice } from "@/components/api/ApiDataNotice";
import { useRailTrack } from "@/context/RailTrackContext";
import { errorMessage, isBackendConfigured, railTrackApi, type SimulationStatus } from "@/lib/api";
import { useApiResource } from "@/lib/useApiResource";

export function SettingsView() {
  const { settings, updateSettings, refreshApiData } = useRailTrack();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const simulation = useApiResource<SimulationStatus | null>(
    "simulation-status",
    railTrackApi.getSimulationStatus,
    null,
    isBackendConfigured,
  );

  const runAction = async (action: string, operation: () => Promise<SimulationStatus>) => {
    setPendingAction(action);
    setActionError(null);
    try {
      simulation.setData(await operation());
      await refreshApiData();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-white">Backend demo simulation</h2>
            <p className="mt-1 text-xs text-slate-400">
              Controls the fictional Spring Boot simulation only; this is not connected to railway operations.
            </p>
          </div>
          {simulation.data ? (
            <span className={`rounded-full border px-2.5 py-1 text-xs ${simulation.data.running
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-slate-400/20 bg-slate-400/10 text-slate-300"}`}>
              {simulation.data.running ? "Running" : "Paused"}
            </span>
          ) : null}
        </div>
        {!isBackendConfigured ? (
          <p className="mt-3 text-xs text-slate-400">
            Set NEXT_PUBLIC_RAILTRACK_API_URL at build time to enable backend simulation controls.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <ApiDataNotice status={simulation.status} error={simulation.error} />
            </div>
            {simulation.data ? (
              <p className="mt-3 text-xs text-slate-400">
                Simulated time: {new Date(simulation.data.simulatedAt).toLocaleString()} · mode: {simulation.data.mode}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!simulation.data || pendingAction !== null}
                onClick={() => void runAction("start", railTrackApi.startSimulation)}
                className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pendingAction === "start" ? "Starting…" : "Start"}
              </button>
              <button
                type="button"
                disabled={!simulation.data || pendingAction !== null}
                onClick={() => void runAction("pause", railTrackApi.pauseSimulation)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pendingAction === "pause" ? "Pausing…" : "Pause"}
              </button>
              <button
                type="button"
                disabled={!simulation.data || pendingAction !== null}
                onClick={() => void runAction("reset", railTrackApi.resetSimulation)}
                className="rounded-xl border border-amber-400/20 px-3 py-2 text-xs text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pendingAction === "reset" ? "Resetting…" : "Reset"}
              </button>
              <button
                type="button"
                disabled={pendingAction !== null}
                onClick={simulation.refresh}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Refresh status
              </button>
            </div>
            {actionError ? <p role="alert" className="mt-3 text-xs text-rose-300">{actionError}</p> : null}
          </>
        )}
      </GlassCard>

      <GlassCard>
        <h2 className="text-sm font-medium text-white">Prototype notes</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          RailTrack is a DEMO SIMULATION command center. Train, delay and passenger values are fictional; no live railway,
          booking, or operational systems are connected.
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
