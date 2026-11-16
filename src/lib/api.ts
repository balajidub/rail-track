import type {
  CoachOccupancy,
  DelayPrediction,
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentSeverity,
  IncidentStatus,
  RouteAlternative,
  Station,
  StationCongestion,
  Train,
  TrainStatus,
  TrainType,
} from "@/types/railway";
import {
  advanceDemoIncident,
  createDemoIncident,
  demoPredictions,
  demoStations,
  demoTrains,
  getDemoCoaches,
  getDemoCongestion,
  getDemoCongestionHistory,
  getDemoIncidents,
  getDemoRouteComparison,
  getDemoSimulationStatus,
  resetDemoSimulation,
  setDemoSimulationRunning,
  updateDemoIncident,
} from "@/lib/demoData";

const API_BASE_URL = process.env.NEXT_PUBLIC_RAILTRACK_API_URL?.trim().replace(/\/+$/, "") ?? "";

interface ApiTrain extends Omit<Train, "status" | "type"> {
  status: string;
  type: string;
}

interface RouteComparisonResponse {
  trainId: string;
  alternatives: RouteAlternative[];
  notice: string;
}

export interface SimulationStatus {
  mode: string;
  running: boolean;
  simulatedAt: string;
  updatedAt: string;
  version: number;
}

export interface RouteComparison {
  trainId: string;
  alternatives: RouteAlternative[];
  notice: string;
}

export interface TrainStatusSummary {
  id: string;
  number: string;
  name: string;
  status: TrainStatus;
  delayMinutes: number;
  summary: string;
}

export interface TrainSummaryResponse {
  totalTrains: number;
  validTrains: number;
  invalidTrains: number;
  onTimeTrains: number;
  delayedTrains: number;
  cancelledTrains: number;
  arrivedTrains: number;
  totalDelayMinutes: number;
  averageDelayMinutes: number;
  maximumDelayMinutes: number;
  trains: TrainStatusSummary[];
}

export const isBackendConfigured = Boolean(API_BASE_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  const body: unknown = response.status === 204 ? undefined : await response.json();

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `Service request failed (${response.status}).`;
    throw new Error(message);
  }

  return body as T;
}

function jsonRequest(method: "POST" | "PUT" | "PATCH", body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function mapTrain(train: ApiTrain): Train {
  const statuses: Record<string, TrainStatus> = {
    ON_TIME: "on-time",
    "on-time": "on-time",
    DELAYED: "delayed",
    delayed: "delayed",
    CANCELLED: "cancelled",
    cancelled: "cancelled",
    ARRIVED: "arrived",
    arrived: "arrived",
  };
  const types: Record<string, TrainType> = {
    RAJDHANI: "Rajdhani",
    Rajdhani: "Rajdhani",
    SHATABDI: "Shatabdi",
    Shatabdi: "Shatabdi",
    VANDE_BHARAT: "Vande Bharat",
    "Vande Bharat": "Vande Bharat",
    DURONTO: "Duronto",
    Duronto: "Duronto",
    SUPERFAST: "Superfast",
    Superfast: "Superfast",
    EXPRESS: "Express",
    Express: "Express",
    MAIL: "Mail",
    Mail: "Mail",
  };
  const status = statuses[train.status];
  const type = types[train.type];

  if (!status || !type) {
    throw new Error(`Service returned an unsupported train status or type for ${train.id}.`);
  }

  return { ...train, status, type };
}

function mapStation(station: Station): Station {
  return {
    ...station,
    lat: Number(station.lat),
    lng: Number(station.lng),
  };
}

export const railTrackApi = {
  async getTrains(): Promise<Train[]> {
    if (!isBackendConfigured) return demoTrains;
    const result = await request<ApiTrain[]>("/api/trains");
    return result.map(mapTrain);
  },

  async getTrainSummary(): Promise<TrainSummaryResponse> {
    if (!isBackendConfigured) {
      const onTimeTrains = demoTrains.filter((train) => train.status === "on-time").length;
      const delayedTrains = demoTrains.filter((train) => train.status === "delayed").length;
      const cancelledTrains = demoTrains.filter((train) => train.status === "cancelled").length;
      const arrivedTrains = demoTrains.filter((train) => train.status === "arrived").length;
      const totalDelayMinutes = demoTrains.reduce((total, train) => total + train.delayMinutes, 0);
      return {
        totalTrains: demoTrains.length,
        validTrains: demoTrains.length,
        invalidTrains: 0,
        onTimeTrains,
        delayedTrains,
        cancelledTrains,
        arrivedTrains,
        totalDelayMinutes,
        averageDelayMinutes: totalDelayMinutes / demoTrains.length,
        maximumDelayMinutes: Math.max(...demoTrains.map((train) => train.delayMinutes)),
        trains: demoTrains.map((train) => ({
          id: train.id,
          number: train.number,
          name: train.name,
          status: train.status,
          delayMinutes: train.delayMinutes,
          summary: train.delayMinutes > 0
            ? `${train.status === "on-time" ? "On time" : "Delayed"} (reported delay: ${train.delayMinutes} minutes)`
            : train.status === "on-time" ? "On time" : train.status[0].toUpperCase() + train.status.slice(1),
        })),
      };
    }
    return request<TrainSummaryResponse>("/api/train-summary");
  },

  async getStations(): Promise<Station[]> {
    if (!isBackendConfigured) return demoStations;
    const result = await request<Station[]>("/api/stations");
    return result.map(mapStation);
  },

  async getIncidents(): Promise<Incident[]> {
    if (!isBackendConfigured) return getDemoIncidents();
    return request<Incident[]>("/api/incidents");
  },

  async getPredictions(): Promise<DelayPrediction[]> {
    if (!isBackendConfigured) return demoPredictions;
    return request<DelayPrediction[]>("/api/predictions");
  },

  async getStationCongestion(stationId: string): Promise<StationCongestion> {
    if (!isBackendConfigured) return getDemoCongestion(stationId);
    return request<StationCongestion>(`/api/stations/${encodeURIComponent(stationId)}/congestion`);
  },

  async getStationCongestionHistory(stationId: string, limit = 50): Promise<StationCongestion[]> {
    if (!isBackendConfigured) return getDemoCongestionHistory(stationId, limit);
    return request<StationCongestion[]>(
      `/api/stations/${encodeURIComponent(stationId)}/congestion/history?limit=${limit}`,
    );
  },

  async getTrainCoaches(trainId: string): Promise<CoachOccupancy[]> {
    if (!isBackendConfigured) return getDemoCoaches(trainId);
    const result = await request<{
      coaches: Array<{
        coach: string;
        occupancyPercent: number;
        level: CoachOccupancy["level"];
      }>;
    }>(`/api/trains/${encodeURIComponent(trainId)}/coaches`);
    return result.coaches;
  },

  async compareRoutes(trainId: string): Promise<RouteComparison> {
    if (!isBackendConfigured) return getDemoRouteComparison(trainId);
    const result = await request<RouteComparisonResponse>(
      "/api/routes/compare",
      jsonRequest("POST", { trainId }),
    );
    return result;
  },

  createIncident(incident: {
    title: string;
    description: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    priority: IncidentPriority;
    trainId: string | null;
    stationId: string | null;
  }): Promise<Incident> {
    if (!isBackendConfigured) return Promise.resolve(createDemoIncident(incident));
    return request<Incident>("/api/incidents", jsonRequest("POST", incident));
  },

  updateIncident(
    id: string,
    incident: {
      title: string;
      description: string;
      category: IncidentCategory;
      severity: IncidentSeverity;
      priority: IncidentPriority;
      trainId: string | null;
      stationId: string | null;
    },
  ): Promise<Incident> {
    if (!isBackendConfigured) return Promise.resolve(updateDemoIncident(id, incident));
    return request<Incident>(
      `/api/incidents/${encodeURIComponent(id)}`,
      jsonRequest("PUT", incident),
    );
  },

  advanceIncident(id: string, status: IncidentStatus): Promise<Incident> {
    if (!isBackendConfigured) return Promise.resolve(advanceDemoIncident(id, status));
    return request<Incident>(
      `/api/incidents/${encodeURIComponent(id)}/status`,
      jsonRequest("PATCH", { status }),
    );
  },

  async getSimulationStatus(): Promise<SimulationStatus> {
    if (!isBackendConfigured) return getDemoSimulationStatus();
    return request<SimulationStatus>("/api/simulation/status");
  },

  async startSimulation(): Promise<SimulationStatus> {
    if (!isBackendConfigured) return setDemoSimulationRunning(true);
    return request<SimulationStatus>("/api/simulation/start", { method: "POST" });
  },

  async pauseSimulation(): Promise<SimulationStatus> {
    if (!isBackendConfigured) return setDemoSimulationRunning(false);
    return request<SimulationStatus>("/api/simulation/pause", { method: "POST" });
  },

  async resetSimulation(): Promise<SimulationStatus> {
    if (!isBackendConfigured) return resetDemoSimulation();
    return request<SimulationStatus>("/api/simulation/reset", { method: "POST" });
  },
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected API error occurred.";
}
