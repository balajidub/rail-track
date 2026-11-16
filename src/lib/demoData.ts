import type {
  CoachOccupancy,
  CoachOccupancyLevel,
  CongestionLevel,
  DelayPrediction,
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentSeverity,
  IncidentStatus,
  PlatformCongestion,
  RouteAlternative,
  Station,
  StationCongestion,
  Train,
  TrainStatus,
  TrainType,
} from "@/types/railway";

interface TrainSeed {
  id: string;
  number: string;
  name: string;
  type: TrainType;
  route: string[];
  departure: string;
  durationMinutes: number;
  distanceKm: number;
  status: TrainStatus;
  delayMinutes: number;
  speed: number;
  progress: number;
  platform: string;
  coaches: number;
  occupancy: number;
}

export const demoStations: Station[] = [
  { id: "NDLS", code: "NDLS", name: "New Delhi", city: "Delhi", state: "Delhi", zone: "NR", lat: 28.642, lng: 77.219, platforms: 16, elevationM: 216 },
  { id: "AGC", code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh", zone: "NCR", lat: 27.158, lng: 77.99, platforms: 6, elevationM: 170 },
  { id: "KOTA", code: "KOTA", name: "Kota Junction", city: "Kota", state: "Rajasthan", zone: "WCR", lat: 25.178, lng: 75.85, platforms: 5, elevationM: 256 },
  { id: "BPL", code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh", zone: "WCR", lat: 23.268, lng: 77.414, platforms: 6, elevationM: 497 },
  { id: "NGP", code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra", zone: "CR", lat: 21.153, lng: 79.089, platforms: 8, elevationM: 310 },
  { id: "MMCT", code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra", zone: "WR", lat: 18.969, lng: 72.819, platforms: 9, elevationM: 8 },
  { id: "MAS", code: "MAS", name: "Chennai Central", city: "Chennai", state: "Tamil Nadu", zone: "SR", lat: 13.082, lng: 80.275, platforms: 17, elevationM: 9 },
  { id: "CNB", code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh", zone: "NCR", lat: 26.449, lng: 80.331, platforms: 10, elevationM: 129 },
  { id: "RKMP", code: "RKMP", name: "Rani Kamalapati", city: "Bhopal", state: "Madhya Pradesh", zone: "WCR", lat: 23.2215, lng: 77.4375, platforms: 6, elevationM: 497 },
  { id: "NZM", code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi", state: "Delhi", zone: "NR", lat: 28.5883, lng: 77.25, platforms: 7, elevationM: 215 },
  { id: "JHS", code: "JHS", name: "Jhansi Junction", city: "Jhansi", state: "Uttar Pradesh", zone: "NCR", lat: 25.4484, lng: 78.5685, platforms: 8, elevationM: 259 },
  { id: "HWH", code: "HWH", name: "Howrah Junction", city: "Howrah", state: "West Bengal", zone: "ER", lat: 22.5837, lng: 88.3426, platforms: 23, elevationM: 12 },
  { id: "ADI", code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat", zone: "WR", lat: 23.0225, lng: 72.5714, platforms: 12, elevationM: 53 },
  { id: "MYS", code: "MYS", name: "Mysuru Junction", city: "Mysuru", state: "Karnataka", zone: "SWR", lat: 12.3129, lng: 76.6453, platforms: 6, elevationM: 763 },
  { id: "TVC", code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala", zone: "SR", lat: 8.4875, lng: 76.9525, platforms: 5, elevationM: 5 },
  { id: "INDB", code: "INDB", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh", zone: "WR", lat: 22.7177, lng: 75.8686, platforms: 6, elevationM: 550 },
  { id: "JBP", code: "JBP", name: "Jabalpur Junction", city: "Jabalpur", state: "Madhya Pradesh", zone: "WCR", lat: 23.1686, lng: 79.9339, platforms: 7, elevationM: 412 },
];

function timeFromMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60).toString().padStart(2, "0");
  const mins = (normalized % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

function makeTrain(seed: TrainSeed): Train {
  const departureMinutes = Number(seed.departure.slice(0, 2)) * 60 + Number(seed.departure.slice(3, 5));
  const lastIndex = seed.route.length - 1;
  const segmentIndex = seed.progress >= 1
    ? lastIndex
    : Math.min(lastIndex - 1, Math.floor(seed.progress * lastIndex));
  const stops = seed.route.map((stationId, index) => {
    const time = timeFromMinutes(departureMinutes + Math.round(seed.durationMinutes * index / lastIndex));
    return {
      stationId,
      arrival: index === 0 ? null : time,
      departure: index === lastIndex ? null : time,
      platform: String((index % 6) + 1),
      distanceKm: Math.round(seed.distanceKm * index / lastIndex),
      haltMin: 0,
    };
  });
  const hours = Math.floor(seed.durationMinutes / 60);
  const minutes = seed.durationMinutes % 60;

  return {
    id: seed.id,
    number: seed.number,
    name: seed.name,
    type: seed.type,
    from: seed.route[0],
    to: seed.route[lastIndex],
    departure: seed.departure,
    arrival: timeFromMinutes(departureMinutes + seed.durationMinutes),
    duration: `${hours}h ${minutes.toString().padStart(2, "0")}m`,
    status: seed.status,
    delayMinutes: seed.delayMinutes,
    speed: seed.status === "arrived" || seed.status === "cancelled" ? 0 : seed.speed,
    currentStationId: seed.route[segmentIndex],
    nextStationId: seed.route[Math.min(segmentIndex + 1, lastIndex)],
    progress: seed.progress,
    platform: seed.platform,
    coaches: seed.coaches,
    occupancy: seed.occupancy,
    distanceKm: seed.distanceKm,
    days: "Daily",
    stops,
  };
}

export const demoTrains: Train[] = [
  makeTrain({ id: "t-12001", number: "12001", name: "Bhopal Shatabdi Express", type: "Shatabdi", route: ["NDLS", "AGC", "BPL", "RKMP"], departure: "06:00", durationMinutes: 440, distanceKm: 707, status: "delayed", delayMinutes: 12, speed: 91, progress: 0.72, platform: "3", coaches: 16, occupancy: 78 }),
  makeTrain({ id: "t-12002", number: "12002", name: "New Delhi Shatabdi Express", type: "Shatabdi", route: ["RKMP", "BPL", "AGC", "NDLS"], departure: "14:00", durationMinutes: 440, distanceKm: 707, status: "on-time", delayMinutes: 0, speed: 103, progress: 0.31, platform: "2", coaches: 16, occupancy: 71 }),
  makeTrain({ id: "t-12033", number: "12033", name: "Kanpur Shatabdi Express", type: "Shatabdi", route: ["NDLS", "CNB"], departure: "06:00", durationMinutes: 355, distanceKm: 440, status: "on-time", delayMinutes: 0, speed: 112, progress: 0.43, platform: "6", coaches: 16, occupancy: 66 }),
  makeTrain({ id: "t-12034", number: "12034", name: "New Delhi Shatabdi Express", type: "Shatabdi", route: ["CNB", "NDLS"], departure: "15:00", durationMinutes: 355, distanceKm: 440, status: "delayed", delayMinutes: 18, speed: 84, progress: 0.64, platform: "6", coaches: 16, occupancy: 88 }),
  makeTrain({ id: "t-12615", number: "12615", name: "Grand Trunk Express", type: "Superfast", route: ["MAS", "NGP", "BPL", "NDLS"], departure: "18:00", durationMinutes: 2160, distanceKm: 2211, status: "on-time", delayMinutes: 0, speed: 94, progress: 0.46, platform: "5", coaches: 22, occupancy: 83 }),
  makeTrain({ id: "t-12616", number: "12616", name: "Grand Trunk Express", type: "Superfast", route: ["NDLS", "BPL", "NGP", "MAS"], departure: "18:00", durationMinutes: 2160, distanceKm: 2211, status: "delayed", delayMinutes: 26, speed: 79, progress: 0.58, platform: "3", coaches: 22, occupancy: 92 }),
  makeTrain({ id: "t-12951", number: "12951", name: "Mumbai Central-New Delhi Rajdhani Express", type: "Rajdhani", route: ["MMCT", "KOTA", "BPL", "NDLS"], departure: "16:35", durationMinutes: 940, distanceKm: 1384, status: "on-time", delayMinutes: 0, speed: 117, progress: 0.57, platform: "3", coaches: 20, occupancy: 81 }),
  makeTrain({ id: "t-12952", number: "12952", name: "New Delhi-Mumbai Central Rajdhani Express", type: "Rajdhani", route: ["NDLS", "BPL", "KOTA", "MMCT"], departure: "16:00", durationMinutes: 940, distanceKm: 1384, status: "delayed", delayMinutes: 34, speed: 72, progress: 0.39, platform: "2", coaches: 20, occupancy: 89 }),
  makeTrain({ id: "t-12301", number: "12301", name: "Howrah-New Delhi Rajdhani Express", type: "Rajdhani", route: ["HWH", "CNB", "NDLS"], departure: "16:55", durationMinutes: 1015, distanceKm: 1451, status: "delayed", delayMinutes: 21, speed: 80, progress: 0.53, platform: "9", coaches: 20, occupancy: 85 }),
  makeTrain({ id: "t-12302", number: "12302", name: "New Delhi-Howrah Rajdhani Express", type: "Rajdhani", route: ["NDLS", "CNB", "HWH"], departure: "16:50", durationMinutes: 1035, distanceKm: 1451, status: "on-time", delayMinutes: 0, speed: 108, progress: 0.28, platform: "3", coaches: 20, occupancy: 77 }),
  makeTrain({ id: "t-12049", number: "12049", name: "Gatimaan Express", type: "Express", route: ["NZM", "JHS"], departure: "08:10", durationMinutes: 265, distanceKm: 403, status: "on-time", delayMinutes: 0, speed: 120, progress: 0.62, platform: "4", coaches: 8, occupancy: 68 }),
  makeTrain({ id: "t-12050", number: "12050", name: "Gatimaan Express", type: "Express", route: ["JHS", "NZM"], departure: "15:05", durationMinutes: 265, distanceKm: 403, status: "arrived", delayMinutes: 0, speed: 0, progress: 1, platform: "2", coaches: 8, occupancy: 62 }),
  makeTrain({ id: "t-12009", number: "12009", name: "Mumbai Central-Ahmedabad Shatabdi Express", type: "Shatabdi", route: ["MMCT", "ADI"], departure: "06:00", durationMinutes: 400, distanceKm: 491, status: "on-time", delayMinutes: 0, speed: 109, progress: 0.48, platform: "5", coaches: 16, occupancy: 73 }),
  makeTrain({ id: "t-12010", number: "12010", name: "Ahmedabad-Mumbai Central Shatabdi Express", type: "Shatabdi", route: ["ADI", "MMCT"], departure: "14:40", durationMinutes: 400, distanceKm: 491, status: "delayed", delayMinutes: 9, speed: 95, progress: 0.52, platform: "3", coaches: 16, occupancy: 79 }),
  makeTrain({ id: "t-12007", number: "12007", name: "Chennai-Mysuru Shatabdi Express", type: "Shatabdi", route: ["MAS", "MYS"], departure: "06:00", durationMinutes: 420, distanceKm: 497, status: "on-time", delayMinutes: 0, speed: 101, progress: 0.36, platform: "6", coaches: 16, occupancy: 70 }),
  makeTrain({ id: "t-12008", number: "12008", name: "Mysuru-Chennai Shatabdi Express", type: "Shatabdi", route: ["MYS", "MAS"], departure: "14:15", durationMinutes: 420, distanceKm: 497, status: "cancelled", delayMinutes: 0, speed: 0, progress: 0, platform: "2", coaches: 16, occupancy: 0 }),
  makeTrain({ id: "t-12625", number: "12625", name: "Kerala Express", type: "Superfast", route: ["NDLS", "BPL", "NGP", "TVC"], departure: "11:25", durationMinutes: 3095, distanceKm: 3036, status: "delayed", delayMinutes: 47, speed: 86, progress: 0.62, platform: "7", coaches: 22, occupancy: 94 }),
  makeTrain({ id: "t-12626", number: "12626", name: "Kerala Express", type: "Superfast", route: ["TVC", "NGP", "BPL", "NDLS"], departure: "11:15", durationMinutes: 3095, distanceKm: 3036, status: "on-time", delayMinutes: 0, speed: 93, progress: 0.22, platform: "3", coaches: 22, occupancy: 74 }),
  makeTrain({ id: "t-12961", number: "12961", name: "Avantika Superfast Express", type: "Superfast", route: ["MMCT", "INDB"], departure: "20:55", durationMinutes: 785, distanceKm: 829, status: "on-time", delayMinutes: 0, speed: 104, progress: 0.45, platform: "4", coaches: 18, occupancy: 82 }),
  makeTrain({ id: "t-12962", number: "12962", name: "Avantika Superfast Express", type: "Superfast", route: ["INDB", "MMCT"], departure: "16:00", durationMinutes: 785, distanceKm: 829, status: "delayed", delayMinutes: 15, speed: 88, progress: 0.67, platform: "1", coaches: 18, occupancy: 86 }),
  makeTrain({ id: "t-12061", number: "12061", name: "Bhopal-Jabalpur Jan Shatabdi Express", type: "Shatabdi", route: ["RKMP", "BPL", "JBP"], departure: "17:40", durationMinutes: 325, distanceKm: 311, status: "on-time", delayMinutes: 0, speed: 97, progress: 0.41, platform: "1", coaches: 16, occupancy: 64 }),
  makeTrain({ id: "t-12062", number: "12062", name: "Jabalpur-Bhopal Jan Shatabdi Express", type: "Shatabdi", route: ["JBP", "BPL", "RKMP"], departure: "06:00", durationMinutes: 325, distanceKm: 311, status: "arrived", delayMinutes: 0, speed: 0, progress: 1, platform: "4", coaches: 16, occupancy: 60 }),
];

const riskLabels: DelayPrediction["risk"][] = ["Low", "Medium", "High", "Critical"];
const riskScores = [22, 38, 67, 82, 31, 74, 47, 91, 28, 56, 63, 35];

export const demoPredictions: DelayPrediction[] = demoTrains.slice(0, riskScores.length).map((train, index) => {
  const riskScore = riskScores[index];
  const risk = riskScore < 30 ? riskLabels[0] : riskScore < 50 ? riskLabels[1] : riskScore < 80 ? riskLabels[2] : riskLabels[3];
  return {
    trainId: train.id,
    riskScore,
    risk,
    predictedDelayMinutes: Math.max(train.delayMinutes, Math.round(riskScore / 2)),
    confidence: 70 + (index * 7) % 26,
    estimatedArrival: train.arrival,
    factors: train.delayMinutes
      ? [`Current recorded delay: ${train.delayMinutes} minutes`, "Route conditions", "Service history"]
      : ["Route conditions", "Service history"],
    recommendation: risk === "Critical"
      ? "Review the route and connecting services."
      : risk === "High"
        ? "Monitor the next scheduled stop."
        : "Continue normal monitoring.",
    trend: [
      { time: "08:00", risk: Math.max(5, riskScore - 16) },
      { time: "08:15", risk: Math.max(5, riskScore - 8) },
      { time: "08:30", risk: riskScore },
    ],
  };
});

function congestionLevel(density: number): CongestionLevel {
  return density >= 85 ? "Critical" : density >= 65 ? "High" : density >= 40 ? "Moderate" : "Low";
}

function makeCongestion(station: Station, stationIndex: number): StationCongestion {
  const trainsHere = demoTrains.filter((train) =>
    train.stops.some((stop) => stop.stationId === station.id),
  );
  const platforms: PlatformCongestion[] = Array.from(
    { length: Math.min(station.platforms, 8) },
    (_, index) => {
      const densityPercent = 24 + ((stationIndex * 13 + index * 17) % 68);
      return {
        platform: index + 1,
        level: congestionLevel(densityPercent),
        densityPercent,
        estimatedPassengers: 120 + stationIndex * 85 + index * 42,
        trainNumbers: trainsHere.slice(index % 2, (index % 2) + 3).map((train) => train.number),
      };
    },
  );
  const activityScore = Math.round(
    platforms.reduce((total, platform) => total + platform.densityPercent, 0) / platforms.length,
  );

  return {
    stationId: station.id,
    level: congestionLevel(activityScore),
    estimatedPassengers: platforms.reduce((total, platform) => total + platform.estimatedPassengers, 0),
    incomingTrains: trainsHere.length,
    outgoingTrains: trainsHere.length,
    platforms,
    activityScore,
    recordedAt: new Date().toISOString(),
  };
}

export const demoCongestion = demoStations.map(makeCongestion);

function makeIncident(
  id: string,
  title: string,
  description: string,
  category: IncidentCategory,
  severity: IncidentSeverity,
  priority: IncidentPriority,
  status: IncidentStatus,
  trainId: string | null,
  stationId: string | null,
  minutesAgo: number,
): Incident {
  const updatedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  return {
    id,
    title,
    description,
    category,
    severity,
    priority,
    status,
    responseTeam: status === "Reported" ? null : "Network response team",
    trainId,
    stationId,
    createdAt: updatedAt,
    updatedAt,
    history: [{ timestamp: updatedAt, note: "Record added to the control room.", status }],
  };
}

let incidents: Incident[] = [
  makeIncident("INC-2048", "Signal inspection near Kanpur", "A signal check is in progress on the corridor.", "Signal failure", "High", "Urgent", "In Progress", "t-12301", "CNB", 8),
  makeIncident("INC-2047", "Platform crowd management", "Additional staff are coordinating passenger flow.", "Station overcrowding", "Medium", "Elevated", "Acknowledged", null, "NDLS", 26),
  makeIncident("INC-2046", "Track inspection completed", "The scheduled track inspection is complete.", "Track obstruction", "Low", "Routine", "Resolved", "t-12033", "AGC", 54),
];

export function getDemoIncidents(): Incident[] {
  return [...incidents];
}

export function createDemoIncident(input: Omit<Incident, "id" | "status" | "responseTeam" | "createdAt" | "updatedAt" | "history">): Incident {
  const now = new Date().toISOString();
  const created: Incident = {
    ...input,
    id: `INC-${Date.now()}`,
    status: "Reported",
    responseTeam: null,
    createdAt: now,
    updatedAt: now,
    history: [{ timestamp: now, note: "Incident reported.", status: "Reported" }],
  };
  incidents = [created, ...incidents];
  return created;
}

export function updateDemoIncident(
  id: string,
  input: Omit<Incident, "id" | "status" | "responseTeam" | "createdAt" | "updatedAt" | "history">,
): Incident {
  const existing = incidents.find((incident) => incident.id === id);
  if (!existing) throw new Error(`Incident ${id} was not found.`);
  const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
  incidents = incidents.map((incident) => incident.id === id ? updated : incident);
  return updated;
}

export function advanceDemoIncident(id: string, status: IncidentStatus): Incident {
  const existing = incidents.find((incident) => incident.id === id);
  if (!existing) throw new Error(`Incident ${id} was not found.`);
  const now = new Date().toISOString();
  const updated: Incident = {
    ...existing,
    status,
    responseTeam: status === "Reported" ? null : existing.responseTeam ?? "Network response team",
    updatedAt: now,
    history: [...existing.history, { timestamp: now, note: `Status changed to ${status}.`, status }],
  };
  incidents = incidents.map((incident) => incident.id === id ? updated : incident);
  return updated;
}

export function getDemoCongestion(stationId: string): StationCongestion {
  const congestion = demoCongestion.find((item) => item.stationId === stationId);
  if (!congestion) throw new Error(`Station ${stationId} was not found.`);
  return congestion;
}

export function getDemoCongestionHistory(stationId: string, limit: number): StationCongestion[] {
  const current = getDemoCongestion(stationId);
  return Array.from({ length: Math.min(limit, 12) }, (_, index) => {
    const offset = (12 - index) * 30 * 60_000;
    const activityScore = Math.max(12, Math.min(95, (current.activityScore ?? 50) - 18 + index * 3));
    return {
      ...current,
      level: congestionLevel(activityScore),
      activityScore,
      recordedAt: new Date(Date.now() - offset).toISOString(),
    };
  });
}

function coachLevel(occupancyPercent: number): CoachOccupancyLevel {
  return occupancyPercent >= 95 ? "Overcrowded" : occupancyPercent >= 80 ? "High" : occupancyPercent >= 55 ? "Moderate" : "Available";
}

export function getDemoCoaches(trainId: string): CoachOccupancy[] {
  const train = demoTrains.find((item) => item.id === trainId);
  if (!train) throw new Error(`Train ${trainId} was not found.`);
  return Array.from({ length: train.coaches }, (_, index) => {
    const occupancyPercent = Math.max(30, Math.min(100, train.occupancy + ((index * 13) % 25) - 12));
    const prefix = train.type === "Rajdhani" ? "A" : train.type === "Shatabdi" ? "C" : "S";
    return {
      coach: `${prefix}${index + 1}`,
      occupancyPercent,
      level: coachLevel(occupancyPercent),
    };
  });
}

export function getDemoRouteComparison(trainId: string): { trainId: string; alternatives: RouteAlternative[]; notice: string } {
  const train = demoTrains.find((item) => item.id === trainId);
  if (!train) throw new Error(`Train ${trainId} was not found.`);
  const durationMinutes = Math.round(train.distanceKm / 75 * 60);
  const waypointId = train.stops.length > 2 ? train.stops[1].stationId : null;
  const connectingTrains = demoTrains
    .filter((item) => item.id !== train.id && item.stops.some((stop) => stop.stationId === train.from || stop.stationId === train.to))
    .slice(0, 3)
    .map((item) => item.number);

  return {
    trainId,
    notice: "Route scenarios are for journey comparison.",
    alternatives: [
      {
        id: `${train.id}-primary`,
        label: "Primary corridor",
        waypointId,
        durationMinutes,
        predictedDelayMinutes: train.delayMinutes,
        affectedStations: train.stops.length,
        affectedTrains: connectingTrains,
        rationale: "Follows the listed corridor and scheduled stops.",
        recommended: true,
      },
      {
        id: `${train.id}-alternate`,
        label: "Alternate timing",
        waypointId: train.stops.length > 2 ? train.stops[train.stops.length - 2].stationId : null,
        durationMinutes: durationMinutes + 24,
        predictedDelayMinutes: Math.max(0, train.delayMinutes - 6),
        affectedStations: Math.max(2, train.stops.length - 1),
        affectedTrains: connectingTrains.slice(0, 2),
        rationale: "Compares a second timing profile for the same corridor.",
        recommended: false,
      },
    ],
  };
}

export interface DemoSimulationStatus {
  mode: string;
  running: boolean;
  simulatedAt: string;
  updatedAt: string;
  version: number;
}

let simulationStatus: DemoSimulationStatus = {
  mode: "OPERATIONS",
  running: true,
  simulatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
};

export function getDemoSimulationStatus(): DemoSimulationStatus {
  return { ...simulationStatus };
}

export function setDemoSimulationRunning(running: boolean): DemoSimulationStatus {
  const now = new Date().toISOString();
  simulationStatus = {
    ...simulationStatus,
    running,
    simulatedAt: now,
    updatedAt: now,
    version: simulationStatus.version + 1,
  };
  return getDemoSimulationStatus();
}

export function resetDemoSimulation(): DemoSimulationStatus {
  const now = new Date().toISOString();
  simulationStatus = { mode: "OPERATIONS", running: false, simulatedAt: now, updatedAt: now, version: 0 };
  return getDemoSimulationStatus();
}
