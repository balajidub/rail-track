export type AppView =
  | "dashboard"
  | "tracking"
  | "trains"
  | "planner"
  | "stations"
  | "analytics"
  | "settings";

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
