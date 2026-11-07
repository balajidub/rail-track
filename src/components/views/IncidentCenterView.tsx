"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useRailTrack } from "@/context/RailTrackContext";
import { incidentSeverityColor } from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import type { Incident, IncidentCategory, IncidentPriority, IncidentSeverity, IncidentStatus } from "@/types/railway";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

const categories: IncidentCategory[] = [
  "Track obstruction",
  "Signal failure",
  "Technical failure",
  "Weather disruption",
  "Station overcrowding",
  "Unscheduled train stoppage",
];
const severities: IncidentSeverity[] = ["Low", "Medium", "High", "Critical"];
const priorities: IncidentPriority[] = ["Routine", "Elevated", "Urgent"];
const statuses: Array<"All" | IncidentStatus> = ["All", "Reported", "Acknowledged", "Response Assigned", "In Progress", "Resolved"];
const workflow: IncidentStatus[] = ["Reported", "Acknowledged", "Response Assigned", "In Progress", "Resolved"];

interface IncidentDraft {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  trainId: string;
  stationId: string;
}

const emptyDraft: IncidentDraft = {
  title: "",
  description: "",
  category: "Track obstruction",
  severity: "Medium",
  priority: "Elevated",
  trainId: "",
  stationId: "",
};

function draftFromIncident(incident: Incident): IncidentDraft {
  return {
    title: incident.title,
    description: incident.description,
    category: incident.category,
    severity: incident.severity,
    priority: incident.priority,
    trainId: incident.trainId ?? "",
    stationId: incident.stationId ?? "",
  };
}

function statusStyle(status: IncidentStatus) {
  return status === "Resolved"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : status === "In Progress"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
      : status === "Reported"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
        : "border-amber-400/20 bg-amber-400/10 text-amber-300";
}

export function IncidentCenterView() {
  const { incidents, addIncident, updateIncident, advanceIncident, trains, stations } = useRailTrack();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | IncidentStatus>("All");
  const [sortBy, setSortBy] = useState<"updated" | "severity">("updated");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<IncidentDraft>(emptyDraft);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => incidents.filter((incident) =>
    (statusFilter === "All" || incident.status === statusFilter) &&
    `${incident.id} ${incident.title} ${incident.description} ${incident.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => sortBy === "updated"
    ? b.updatedAt.localeCompare(a.updatedAt)
    : severities.indexOf(b.severity) - severities.indexOf(a.severity)),
  [incidents, query, sortBy, statusFilter]);
  const selected = filtered.find((incident) => incident.id === selectedId) ?? filtered[0] ?? incidents[0];
  const activeCount = incidents.filter((incident) => incident.status !== "Resolved").length;
  const criticalCount = incidents.filter((incident) => incident.severity === "Critical" && incident.status !== "Resolved").length;

  const beginCreate = () => {
    setDraft(emptyDraft);
    setFormError("");
    setEditing(false);
    setShowForm((open) => !open);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      severity: draft.severity,
      priority: draft.priority,
      trainId: draft.trainId || null,
      stationId: draft.stationId || null,
    };
    if (!data.title || !data.description) {
      setFormError("Add a title and description before saving.");
      return;
    }
    if (editing && selected) {
      updateIncident(selected.id, data);
      setEditing(false);
    } else {
      const id = addIncident(data);
      setSelectedId(id);
      setShowForm(false);
    }
    setFormError("");
  };

  const startEdit = (incident: Incident) => {
    setDraft(draftFromIncident(incident));
    setEditing(true);
    setShowForm(true);
    setFormError("");
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">V2 · response workflow</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Incident management center</h1>
          <p className="mt-1 text-sm text-slate-400">Fictional scenarios only. Incident changes remain in shared app state for this browser session.</p>
        </div>
        <button type="button" onClick={beginCreate} className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-medium text-slate-950">
          {showForm && !editing ? "Hide report form" : "＋ Report incident"}
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Total scenarios" value={incidents.length} />
        <Summary label="Active incidents" value={activeCount} />
        <Summary label="Critical active" value={criticalCount} />
      </div>

      {showForm ? (
        <GlassCard>
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-base font-medium text-white">{editing ? "Edit incident" : "Report a simulated incident"}</h2><p className="mt-1 text-xs text-slate-400">No external operational systems are contacted.</p></div>
            <button type="button" onClick={() => { setShowForm(false); setEditing(false); }} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>
          <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Incident title"><input required maxLength={100} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="select-field" placeholder="Brief incident summary" /></Field>
            <Field label="Category"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as IncidentCategory })} className="select-field">{categories.map((category) => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Severity"><select value={draft.severity} onChange={(event) => setDraft({ ...draft, severity: event.target.value as IncidentSeverity })} className="select-field">{severities.map((severity) => <option key={severity}>{severity}</option>)}</select></Field>
            <Field label="Priority"><select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as IncidentPriority })} className="select-field">{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></Field>
            <Field label="Linked train"><select value={draft.trainId} onChange={(event) => setDraft({ ...draft, trainId: event.target.value })} className="select-field"><option value="">No linked train</option>{trains.map((train) => <option key={train.id} value={train.id}>{train.number} · {train.name}</option>)}</select></Field>
            <Field label="Linked station"><select value={draft.stationId} onChange={(event) => setDraft({ ...draft, stationId: event.target.value })} className="select-field"><option value="">No linked station</option>{stations.map((station) => <option key={station.id} value={station.id}>{station.code} · {station.name}</option>)}</select></Field>
            <Field label="Description"><textarea required maxLength={500} rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="select-field h-auto min-h-20 py-2" placeholder="Describe this simulated scenario" /></Field>
            <div className="flex items-end gap-3"><button type="submit" className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-medium text-slate-950">{editing ? "Save changes" : "Create incident"}</button>{formError ? <p role="alert" className="pb-2 text-xs text-rose-300">{formError}</p> : null}</div>
          </form>
        </GlassCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard padding={false} className="overflow-hidden">
          <div className="grid gap-2 border-b border-white/5 p-4 sm:grid-cols-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="select-field sm:col-span-3" placeholder="Search incident ID, title or category" aria-label="Search incidents" />
            <label className="sr-only" htmlFor="incident-status">Filter incidents by status</label>
            <select id="incident-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | IncidentStatus)} className="select-field">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
            <label className="sr-only" htmlFor="incident-sort">Sort incidents</label>
            <select id="incident-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as "updated" | "severity")} className="select-field"><option value="updated">Recently updated</option><option value="severity">Highest severity</option></select>
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {filtered.length === 0 ? <p className="p-5 text-sm text-slate-400">No incidents match this filter.</p> :
              filtered.map((incident) => (
                <button key={incident.id} type="button" onClick={() => { setSelectedId(incident.id); setShowForm(false); setEditing(false); }}
                  className={cn("w-full border-b border-white/5 p-4 text-left hover:bg-white/[0.04]", selected?.id === incident.id && "bg-cyan-400/[0.07]")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{incident.id}</span>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px]", incidentSeverityColor(incident.severity))}>{incident.severity}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">{incident.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span>{incident.category}</span><span>·</span><span className={cn("rounded-full border px-2 py-0.5", statusStyle(incident.status))}>{incident.status}</span></div>
                </button>
              ))}
          </div>
        </GlassCard>

        {selected ? (
          <div className="space-y-5">
            <GlassCard>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-mono text-xs text-cyan-300">{selected.id} · {selected.category}</p><h2 className="mt-1 text-xl font-semibold text-white">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{selected.description}</p></div>
                <span className={cn("rounded-full border px-3 py-1.5 text-xs", incidentSeverityColor(selected.severity))}>{selected.severity} · {selected.priority}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Info label="Linked train" value={trains.find((train) => train.id === selected.trainId)?.number ?? "None"} />
                <Info label="Linked station" value={stations.find((station) => station.id === selected.stationId)?.name ?? "None"} />
                <Info label="Created" value={formatTimestamp(selected.createdAt)} />
                <Info label="Last updated" value={formatTimestamp(selected.updatedAt)} />
              </div>
              <div className="mt-5">
                <h3 className="text-xs uppercase tracking-wider text-slate-500">Response workflow</h3>
                <div className="mt-3 grid grid-cols-5 gap-1">
                  {workflow.map((status, index) => {
                    const current = workflow.indexOf(selected.status);
                    return <div key={status} className={cn("h-1.5 rounded-full", index <= current ? "bg-cyan-400" : "bg-white/10")} title={status} />;
                  })}
                </div>
                <div className="mt-2 flex justify-between gap-2 text-[9px] text-slate-500">{workflow.map((status) => <span key={status} className="max-w-14">{status}</span>)}</div>
              </div>
              {selected.status !== "Resolved" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEdit(selected)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5">Edit incident</button>
                  <button type="button" onClick={() => advanceIncident(selected.id)} className="rounded-xl bg-cyan-400 px-3 py-2 text-xs font-medium text-slate-950">{selected.status === "In Progress" ? "Resolve incident" : `Advance to ${workflow[workflow.indexOf(selected.status) + 1]}`}</button>
                </div>
              ) : <p className="mt-4 text-xs text-emerald-300">Resolved · this scenario is closed.</p>}
            </GlassCard>
            <GlassCard>
              <h3 className="text-sm font-medium text-white">Incident timeline</h3>
              <ol className="mt-4 space-y-4">
                {[...selected.history].reverse().map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="flex gap-3">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", entry.status === "Resolved" ? "bg-emerald-400" : "bg-cyan-400")} />
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm text-slate-200">{entry.note}</p><span className="text-[10px] text-slate-500">{formatTimestamp(entry.timestamp)}</span></div><p className="mt-1 text-[10px] text-slate-500">{entry.status}</p></div>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </div>
        ) : <GlassCard><p className="text-sm text-slate-400">Report an incident to start the response workflow.</p></GlassCard>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <GlassCard><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></GlassCard>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-200">{value}</p></div>;
}

function formatTimestamp(value: string) {
  return `${value.slice(0, 16).replace("T", " ")} UTC`;
}
