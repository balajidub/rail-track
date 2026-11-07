export type AppView =
  | "dashboard"
  | "tracking"
  | "trains"
  | "planner"
  | "stations"
  | "analytics"
  | "settings"
  | "predictions"
  | "station-intelligence"
  | "incidents"
  | "coaches"
  | "route-optimization";

export type TrainStatus = "on-time" | "delayed" | "cancelled" | "arrived";

export type TrainType =
  | "Rajdhani"
  | "Shatabdi"
  | "Vande Bharat"
  | "Duronto"
  | "Superfast"
  | "Express"
  | "Mail";

export type AlertSeverity = "info" | "warning" | "critical";

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  lat: number;
  lng: number;
  platforms: number;
  elevationM: number;
}

export interface Stop {
  stationId: string;
  arrival: string | null;
  departure: string | null;
  platform: string;
  distanceKm: number;
  haltMin: number;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  status: TrainStatus;
  delayMinutes: number;
  speed: number;
  currentStationId: string;
  nextStationId: string;
  progress: number;
  platform: string;
  coaches: number;
  occupancy: number;
  distanceKm: number;
  days: string;
  stops: Stop[];
}

export interface DelayAlert {
  id: string;
  trainId: string;
  title: string;
  message: string;
  time: string;
  severity: AlertSeverity;
  read: boolean;
}

export interface HourlyTraffic {
  hour: string;
  running: number;
  delayed: number;
}

export interface PunctualityPoint {
  day: string;
  onTime: number;
  delayed: number;
}

export interface CorridorDelay {
  corridor: string;
  minutes: number;
}

export type PredictionRisk = "Low" | "Medium" | "High" | "Critical";

export interface DelayPrediction {
  trainId: string;
  riskScore: number;
  risk: PredictionRisk;
  predictedDelayMinutes: number;
  confidence: number;
  estimatedArrival: string;
  factors: string[];
  recommendation: string;
  trend: Array<{ time: string; risk: number }>;
}

export type CongestionLevel = "Low" | "Moderate" | "High" | "Critical";

export interface PlatformCongestion {
  platform: number;
  level: CongestionLevel;
  densityPercent: number;
  estimatedPassengers: number;
  trainNumbers: string[];
}

export interface StationCongestion {
  stationId: string;
  level: CongestionLevel;
  estimatedPassengers: number;
  incomingTrains: number;
  outgoingTrains: number;
  platforms: PlatformCongestion[];
}

export type IncidentCategory =
  | "Track obstruction"
  | "Signal failure"
  | "Technical failure"
  | "Weather disruption"
  | "Station overcrowding"
  | "Unscheduled train stoppage";
export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentPriority = "Routine" | "Elevated" | "Urgent";
export type IncidentStatus =
  | "Reported"
  | "Acknowledged"
  | "Response Assigned"
  | "In Progress"
  | "Resolved";

export interface IncidentHistoryEntry {
  timestamp: string;
  note: string;
  status: IncidentStatus;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  status: IncidentStatus;
  trainId: string | null;
  stationId: string | null;
  createdAt: string;
  updatedAt: string;
  history: IncidentHistoryEntry[];
}

export type CoachOccupancyLevel = "Available" | "Moderate" | "High" | "Overcrowded";

export interface CoachOccupancy {
  coach: string;
  occupancyPercent: number;
  level: CoachOccupancyLevel;
}

export interface RouteAlternative {
  id: string;
  label: string;
  waypointId: string | null;
  durationMinutes: number;
  predictedDelayMinutes: number;
  affectedStations: number;
  affectedTrains: string[];
  rationale: string;
  recommended: boolean;
}
