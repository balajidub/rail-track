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
import { delayAlerts as seedAlerts, seedIncidents, stations as seedStations, trains as seedTrains } from "@/data/mock";
import { errorMessage, isBackendConfigured, railTrackApi } from "@/lib/api";
import { currentAndNextStop, matchesQuery } from "@/lib/utils";
import type { AppView, DelayAlert, Incident, Station, Train, TrainStatus } from "@/types/railway";

type BackendStatus = "mock" | "loading" | "connected" | "partial" | "unavailable";
type IncidentFields = Pick<Incident, "title" | "description" | "category" | "severity" | "priority" | "trainId" | "stationId">;
type Settled<T> = { data: T; error: null } | { data: null; error: string };

async function settle<T>(operation: () => Promise<T>): Promise<Settled<T>> {
  try {
    return { data: await operation(), error: null };
  } catch (error) {
    return { data: null, error: errorMessage(error) };
  }
}

function mergeById<T extends { id: string }>(mock: T[], api: T[]): T[] {
  const apiById = new Map(api.map((item) => [item.id, item]));
  const mockIds = new Set(mock.map((item) => item.id));
  return [
    ...mock.map((item) => apiById.get(item.id) ?? item),
    ...api.filter((item) => !mockIds.has(item.id)),
  ];
}

function mergeIncidents(existing: Incident[], api: Incident[]): Incident[] {
  const apiTitles = new Set(api.map((incident) => incident.title.trim().toLowerCase()));
  return [
    ...api,
    ...existing.filter((incident) => !apiTitles.has(incident.title.trim().toLowerCase())),
  ];
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
  operatorName: "John",
  controlRoom: "New Delhi Command Center",
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
  backendStatus: BackendStatus;
  backendError: string | null;
  refreshApiData: () => Promise<void>;
}

const RailTrackContext = createContext<RailTrackContextValue | null>(null);

export function RailTrackProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>("dashboard");
  const [liveTrains, setLiveTrains] = useState<Train[]>(seedTrains);
  const [stationData, setStationData] = useState<Station[]>(seedStations);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(seedTrains[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TrainStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [alerts, setAlerts] = useState<DelayAlert[]>(seedAlerts);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [clock, setClock] = useState("18:42:11");
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents);
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(isBackendConfigured ? "loading" : "mock");
  const [backendError, setBackendError] = useState<string | null>(null);

  const refreshApiData = useCallback(async () => {
    if (!isBackendConfigured) {
      setBackendStatus("mock");
      setBackendError(null);
      setBackendConnected(false);
      return;
    }

    setBackendStatus("loading");
    const [trainResult, stationResult, incidentResult] = await Promise.all([
      settle(railTrackApi.getTrains),
      settle(railTrackApi.getStations),
      settle(railTrackApi.getIncidents),
    ]);

    if (trainResult.data) {
      setLiveTrains((current) => mergeById(current, trainResult.data));
    }
    if (stationResult.data) {
      setStationData((current) => mergeById(current, stationResult.data));
    }
    if (incidentResult.data) {
      setIncidents((current) => mergeIncidents(current, incidentResult.data));
    }

    const successes = [trainResult, stationResult, incidentResult].filter((result) => result.data !== null).length;
    const errors = [trainResult, stationResult, incidentResult]
      .flatMap((result) => result.error ? [result.error] : []);
    setBackendConnected(trainResult.data !== null);
    setBackendError(errors.length ? errors.join(" ") : null);
    setBackendStatus(successes === 0 ? "unavailable" : errors.length ? "partial" : "connected");
  }, []);

  const refreshTrainsFromApi = useCallback(async () => {
    const result = await settle(railTrackApi.getTrains);
    if (result.error !== null) {
      setBackendConnected(false);
      setBackendStatus("unavailable");
      setBackendError(result.error);
      return;
    }
    setLiveTrains((current) => mergeById(current, result.data));
    setBackendConnected(true);
    setBackendStatus((status) => status === "partial" || backendError ? "partial" : "connected");
  }, [backendError]);

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
    if (!settings.autoRefresh || backendConnected) return;

    const id = window.setInterval(() => {
      setLiveTrains((current) =>
        current.map((train) => {
          if (train.status === "cancelled" || train.status === "arrived") return train;

          const increment = 0.008 + train.speed / 18000;
          const progress = Math.min(1, train.progress + increment);
          const status: TrainStatus =
            progress >= 0.99 ? "arrived" : train.delayMinutes >= 15 ? "delayed" : "on-time";
          const speed =
            status === "arrived"
              ? 0
              : Math.max(42, Math.min(140, train.speed + ((progress * 10) % 5) - 2));
          const { current: currentStop, next } = currentAndNextStop({ ...train, progress });

          return {
            ...train,
            progress,
            status,
            speed: Math.round(speed),
            currentStationId: currentStop.stationId,
            nextStationId: next.stationId,
            delayMinutes:
              train.status === "delayed"
                ? train.delayMinutes + (progress > 0.9 ? 0 : 0)
                : train.delayMinutes,
          };
        }),
      );
    }, 2800);

    return () => window.clearInterval(id);
  }, [backendConnected, settings.autoRefresh]);

  useEffect(() => {
    if (!settings.autoRefresh || !backendConnected) return;
    const id = window.setInterval(() => {
      void refreshTrainsFromApi();
    }, 10_000);
    return () => window.clearInterval(id);
  }, [backendConnected, refreshTrainsFromApi, settings.autoRefresh]);

  const stations = stationData;

  const trains = useMemo(
    () =>
      liveTrains.map((train) => {
        if (train.status === "cancelled" || train.status === "arrived") return train;
        return {
          ...train,
          status: (train.delayMinutes >= settings.delayThreshold ? "delayed" : "on-time") as TrainStatus,
        };
      }),
    [liveTrains, settings.delayThreshold],
  );

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

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const selectTrain = useCallback((id: string | null) => {
    setSelectedTrainId(id);
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts((current) =>
      current.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((current) => current.map((alert) => ({ ...alert, read: true })));
  }, []);

  const updateSettings = useCallback((patch: Partial<SettingsState>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const addIncident = useCallback(async (incident: IncidentFields) => {
    if (isBackendConfigured) {
      const saved = await railTrackApi.createIncident(incident);
      setIncidents((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      return saved.id;
    }
    const now = new Date().toISOString();
    const id = `INC-${Date.now()}`;
    setIncidents((current) => [
      {
        ...incident,
        id,
        status: "Reported",
        createdAt: now,
        updatedAt: now,
        history: [{ timestamp: now, note: "Incident reported to the control room.", status: "Reported" }],
      },
      ...current,
    ]);
    return id;
  }, []);

  const updateIncident = useCallback(async (id: string, patch: IncidentFields) => {
    if (isBackendConfigured) {
      const saved = await railTrackApi.updateIncident(id, patch);
      setIncidents((current) => current.map((incident) => incident.id === id ? saved : incident));
      return;
    }
    const now = new Date().toISOString();
    setIncidents((current) =>
      current.map((incident) => incident.id === id && incident.status !== "Resolved"
        ? {
            ...incident,
            ...patch,
            updatedAt: now,
            history: [...incident.history, {
              timestamp: now,
              note: "Incident details updated.",
              status: incident.status,
            }],
          }
        : incident),
    );
  }, []);

  const advanceIncident = useCallback(async (id: string) => {
    const workflow = ["Reported", "Acknowledged", "Response Assigned", "In Progress", "Resolved"] as const;
    const currentIncident = incidents.find((incident) => incident.id === id);
    if (!currentIncident || currentIncident.status === "Resolved") return;
    const nextStatus = workflow[workflow.indexOf(currentIncident.status) + 1];
    if (!nextStatus) return;
    if (isBackendConfigured) {
      const saved = await railTrackApi.advanceIncident(id, nextStatus);
      setIncidents((current) => current.map((incident) => incident.id === id ? saved : incident));
      return;
    }
    const now = new Date().toISOString();
    setIncidents((current) =>
      current.map((incident) => {
        if (incident.id !== id || incident.status === "Resolved") return incident;
        const status = workflow[Math.min(workflow.indexOf(incident.status) + 1, workflow.length - 1)];
        return {
          ...incident,
          status,
          updatedAt: now,
          history: [...incident.history, { timestamp: now, note: `Status advanced to ${status}.`, status }],
        };
      }),
    );
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
    backendStatus,
    backendError,
    refreshApiData,
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
