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
import { delayAlerts as seedAlerts, stations, trains as seedTrains } from "@/data/mock";
import { currentAndNextStop, matchesQuery } from "@/lib/utils";
import type { AppView, DelayAlert, Train, TrainStatus } from "@/types/railway";

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
  stations: typeof stations;
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
}

const RailTrackContext = createContext<RailTrackContextValue | null>(null);

export function RailTrackProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>("dashboard");
  const [liveTrains, setLiveTrains] = useState<Train[]>(seedTrains);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(seedTrains[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TrainStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [alerts, setAlerts] = useState<DelayAlert[]>(seedAlerts);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [clock, setClock] = useState("18:42:11");

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
    if (!settings.autoRefresh) return;

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
  }, [settings.autoRefresh]);

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
  }, [trains, query, statusFilter, typeFilter]);

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
