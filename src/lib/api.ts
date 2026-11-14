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

const API_BASE_URL = process.env.NEXT_PUBLIC_RAILTRACK_API_URL?.replace(/\/+$/, "") ?? "";

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
        : `Backend request failed (${response.status}).`;
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
    throw new Error(`Backend returned an unsupported train status or type for ${train.id}.`);
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
    const result = await request<ApiTrain[]>("/api/trains");
    return result.map(mapTrain);
  },

  async getStations(): Promise<Station[]> {
    const result = await request<Station[]>("/api/stations");
    return result.map(mapStation);
  },

  getIncidents(): Promise<Incident[]> {
    return request<Incident[]>("/api/incidents");
  },

  getPredictions(): Promise<DelayPrediction[]> {
    return request<DelayPrediction[]>("/api/predictions");
  },

  getStationCongestion(stationId: string): Promise<StationCongestion> {
    return request<StationCongestion>(`/api/stations/${encodeURIComponent(stationId)}/congestion`);
  },

  getStationCongestionHistory(stationId: string, limit = 50): Promise<StationCongestion[]> {
    return request<StationCongestion[]>(
      `/api/stations/${encodeURIComponent(stationId)}/congestion/history?limit=${limit}`,
    );
  },

  async getTrainCoaches(trainId: string): Promise<CoachOccupancy[]> {
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
    return request<Incident>(
      `/api/incidents/${encodeURIComponent(id)}`,
      jsonRequest("PUT", incident),
    );
  },

  advanceIncident(id: string, status: IncidentStatus): Promise<Incident> {
    return request<Incident>(
      `/api/incidents/${encodeURIComponent(id)}/status`,
      jsonRequest("PATCH", { status }),
    );
  },

  getSimulationStatus(): Promise<SimulationStatus> {
    return request<SimulationStatus>("/api/simulation/status");
  },

  startSimulation(): Promise<SimulationStatus> {
    return request<SimulationStatus>("/api/simulation/start", { method: "POST" });
  },

  pauseSimulation(): Promise<SimulationStatus> {
    return request<SimulationStatus>("/api/simulation/pause", { method: "POST" });
  },

  resetSimulation(): Promise<SimulationStatus> {
    return request<SimulationStatus>("/api/simulation/reset", { method: "POST" });
  },
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected API error occurred.";
}
