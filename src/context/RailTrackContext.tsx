"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { errorMessage, isBackendConfigured, railTrackApi } from "@/lib/api";
import { demoStations, demoTrains, getDemoIncidents } from "@/lib/demoData";
import { matchesQuery } from "@/lib/utils";
import type { AppView, DelayAlert, Incident, Station, Train, TrainStatus } from "@/types/railway";

type IncidentFields = Pick<Incident, "title" | "description" | "category" | "severity" | "priority" | "trainId" | "stationId">;
type Settled<T> = { data: T; error: null } | { data: null; error: string };

async function settle<T>(operation: () => Promise<T>): Promise<Settled<T>> {
  try {
    return { data: await operation(), error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

export interface SettingsState {
  operatorName: string;
  controlRoom: string;
  autoRefresh: boolean;
  compactLists: boolean;
  delayThreshold: number;
  pushAlerts: boolean;
}

const defaultSettings: SettingsState = {
  operatorName: "",
  controlRoom: "",
  autoRefresh: true,
  compactLists: false,
  delayThreshold: 15,
  pushAlerts: true,
};

interface RailTrackContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  trains: Train[];
  stations: Station[];
  selectedTrainId: string | null;
  selectedTrain: Train | undefined;
  selectTrain: (id: string | null) => void;
  query: string;
  setQuery: (value: string) => void;
  statusFilter: "all" | TrainStatus;
  setStatusFilter: (value: "all" | TrainStatus) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  filteredTrains: Train[];
  alerts: DelayAlert[];
  unreadCount: number;
  markAlertRead: (id: string) => void;
  markAllRead: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settings: SettingsState;
  updateSettings: (patch: Partial<SettingsState>) => void;
  clock: string;
  incidents: Incident[];
  addIncident: (incident: IncidentFields) => Promise<string>;
  updateIncident: (id: string, patch: IncidentFields) => Promise<void>;
  advanceIncident: (id: string) => Promise<void>;
  refreshApiData: () => Promise<void>;
  dataError: string | null;
}

const RailTrackContext = createContext<RailTrackContextValue | null>(null);

export function RailTrackProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>("dashboard");
  const [liveTrains, setLiveTrains] = useState<Train[]>(isBackendConfigured ? [] : demoTrains);
  const [stationData, setStationData] = useState<Station[]>(isBackendConfigured ? [] : demoStations);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TrainStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(() => new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [clock, setClock] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>(isBackendConfigured ? [] : getDemoIncidents());
  const [dataError, setDataError] = useState<string | null>(null);
  const refreshApiData = useCallback(async () => {
    const [trainResult, stationResult, incidentResult] = await Promise.all([
      settle(railTrackApi.getTrains),
      settle(railTrackApi.getStations),
      settle(railTrackApi.getIncidents),
    ]);

    if (trainResult.data !== null) {
      setLiveTrains(trainResult.data);
      setSelectedTrainId((current) =>
        current && trainResult.data.some((train) => train.id === current)
          ? current
          : trainResult.data[0]?.id ?? null,
      );
    }
    if (stationResult.data !== null) {
      setStationData(stationResult.data);
    }
    if (incidentResult.data !== null) {
      setIncidents(incidentResult.data);
    }
    const errors = [trainResult, stationResult, incidentResult]
      .flatMap((result) => result.error ? [result.error] : []);
    setDataError(errors.length ? errors.join(" ") : null);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshApiData();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshApiData]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!settings.autoRefresh) return;
    const id = window.setInterval(() => {
      void refreshApiData();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [refreshApiData, settings.autoRefresh]);

  const stations = stationData;
  const trains = liveTrains;

  const filteredTrains = useMemo(() => {
    return trains.filter((train) => {
      const queryOk = matchesQuery(train, stations, query);
      const statusOk = statusFilter === "all" || train.status === statusFilter;
      const typeOk = typeFilter === "all" || train.type === typeFilter;
      return queryOk && statusOk && typeOk;
    });
  }, [trains, stations, query, statusFilter, typeFilter]);

  const selectedTrain = useMemo(
    () => trains.find((train) => train.id === selectedTrainId),
    [trains, selectedTrainId],
  );

  const alerts = useMemo<DelayAlert[]>(() => {
    if (!settings.pushAlerts) return [];
    return trains
      .filter((train) => train.delayMinutes >= settings.delayThreshold && train.delayMinutes > 0)
      .map((train) => ({
        id: train.id,
        trainId: train.id,
        title: `${train.number} · ${train.name} delay`,
        message: `${train.number} is ${train.delayMinutes} minutes behind schedule.`,
        time: "Recent update",
        severity: train.delayMinutes >= 60 ? "critical" : "warning",
        read: readAlertIds.has(train.id),
      }));
  }, [readAlertIds, settings.delayThreshold, settings.pushAlerts, trains]);

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const selectTrain = useCallback((id: string | null) => {
    setSelectedTrainId(id);
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setReadAlertIds((current) => new Set(current).add(id));
  }, []);

  const markAllRead = useCallback(() => setReadAlertIds(new Set(alerts.map((alert) => alert.id))), [alerts]);

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const addIncident = useCallback(async (incident: IncidentFields) => {
    const saved = await railTrackApi.createIncident(incident);
    setIncidents((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    return saved.id;
  }, []);

  const updateIncident = useCallback(async (id: string, patch: IncidentFields) => {
    const saved = await railTrackApi.updateIncident(id, patch);
    setIncidents((current) => current.map((incident) => incident.id === id ? saved : incident));
  }, []);

  const advanceIncident = useCallback(async (id: string) => {
    const currentIncident = incidents.find((incident) => incident.id === id);
    if (!currentIncident || currentIncident.status === "Resolved") return;
    const workflow = ["Reported", "Acknowledged", "Response Assigned", "In Progress", "Resolved"] as const;
    const nextStatus = workflow[workflow.indexOf(currentIncident.status) + 1];
    if (!nextStatus) return;
    const saved = await railTrackApi.advanceIncident(id, nextStatus);
    setIncidents((current) => current.map((incident) => incident.id === id ? saved : incident));
  }, [incidents]);

  const value: RailTrackContextValue = {
    view,
    setView,
    trains,
    stations,
    selectedTrainId,
    selectedTrain,
    selectTrain,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredTrains,
    alerts,
    unreadCount,
    markAlertRead,
    markAllRead,
    sidebarOpen,
    setSidebarOpen,
    settings,
    updateSettings,
    clock,
    incidents,
    addIncident,
    updateIncident,
    advanceIncident,
    refreshApiData,
    dataError,
  };

  return <RailTrackContext.Provider value={value}>{children}</RailTrackContext.Provider>;
}

export function useRailTrack() {
  const context = useContext(RailTrackContext);
  if (!context) {
    throw new Error("useRailTrack must be used within RailTrackProvider");
  }
  return context;
}
