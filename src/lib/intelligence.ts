import type {
  CoachOccupancy,
  CongestionLevel,
  DelayPrediction,
  IncidentSeverity,
  PlatformCongestion,
  PredictionRisk,
  RouteAlternative,
  Station,
  StationCongestion,
  Train,
} from "@/types/railway";
import { stations as mockStations } from "@/data/mock";

function bounded(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function predictionRisk(score: number): PredictionRisk {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export function predictTrainDelay(train: Train, allTrains: Train[] = [train]): DelayPrediction {
  const sharedServices = allTrains.filter(
    (other) => other.id !== train.id && other.stops.some((stop) => train.stops.some((trainStop) => trainStop.stationId === stop.stationId)),
  ).length;
  const score = train.status === "cancelled"
    ? 100
    : train.status === "arrived"
      ? 8
      : bounded(
          Math.round(
            train.delayMinutes * 0.8 +
            Math.max(0, train.occupancy - 65) * 0.42 +
            (train.speed < 70 ? 18 : train.speed < 95 ? 8 : 0) +
            Math.min(sharedServices * 2, 12) +
            (train.progress > 0.85 && train.delayMinutes > 0 ? 8 : 0),
          ),
          5,
          98,
        );
  const factors: string[] = [];
  if (train.delayMinutes > 0) factors.push(`Existing delay of ${train.delayMinutes} minutes`);
  if (train.occupancy >= 85) factors.push(`High simulated occupancy (${train.occupancy}%)`);
  if (sharedServices > 1) factors.push(`Potential corridor congestion: ${sharedServices} simulated services share listed stops`);
  if (train.speed > 0 && train.speed < 90) factors.push(`Reduced simulated speed (${train.speed} km/h); a section restriction is possible but unconfirmed`);
  if (train.progress > 0.8 && train.delayMinutes > 0) factors.push("Limited recovery time near destination");
  const hasElevatedIndicators = factors.length > 0;
  if (factors.length === 0) factors.push("No elevated indicators in the current simulation");
  if (train.status !== "arrived" && train.status !== "cancelled") factors.push("Weather observations are unavailable and are not included in this estimate");

  const risk = predictionRisk(score);
  const predictedDelayMinutes = train.status === "cancelled"
    ? 0
    : train.status === "arrived"
      ? train.delayMinutes
      : Math.max(train.delayMinutes, Math.round(score * 0.42));
  const [arrivalHours, arrivalMinutes] = train.arrival.split(":").map(Number);
  const revisedArrivalMinutes = (arrivalHours * 60 + arrivalMinutes + predictedDelayMinutes) % (24 * 60);
  const estimatedArrival = `${Math.floor(revisedArrivalMinutes / 60).toString().padStart(2, "0")}:${(revisedArrivalMinutes % 60).toString().padStart(2, "0")}`;
  const recommendations: Record<PredictionRisk, string> = {
    Low: "Continue routine monitoring; no additional simulated intervention indicated.",
    Medium: "Review the next scheduled stop and monitor for a change in running time.",
    High: "Prioritize a corridor review and check connecting service impacts.",
    Critical: "Escalate to the simulation control desk for immediate scenario review.",
  };
  const trend = [
    { time: "−30m", risk: bounded(score - 12, 0, 100) },
    { time: "−20m", risk: bounded(score - 7, 0, 100) },
    { time: "−10m", risk: bounded(score - 3, 0, 100) },
    { time: "Now", risk: score },
  ];

  return {
    trainId: train.id,
    riskScore: score,
    risk,
    predictedDelayMinutes,
    confidence: bounded(70 + Math.round(train.progress * 12) - (hasElevatedIndicators ? 0 : 8), 55, 94),
    estimatedArrival,
    factors,
    recommendation: recommendations[risk],
    trend,
  };
}

function congestionLevel(density: number): CongestionLevel {
  if (density >= 85) return "Critical";
  if (density >= 65) return "High";
  if (density >= 40) return "Moderate";
  return "Low";
}

export function stationCongestion(station: Station, trains: Train[]): StationCongestion {
  const services = trains.filter((train) => train.stops.some((stop) => stop.stationId === station.id));
  const incomingTrains = services.filter((train) => train.nextStationId === station.id).length;
  const outgoingTrains = services.filter((train) => train.currentStationId === station.id).length;
  const platformCount = Math.max(station.platforms, 1);
  const platforms: PlatformCongestion[] = Array.from({ length: platformCount }, (_, index) => {
    const platform = index + 1;
    const trainsOnPlatform = services.filter((train) => Number(train.platform) === platform);
    const seed = station.code.charCodeAt(0) + station.code.charCodeAt(station.code.length - 1);
    const densityPercent = bounded(22 + ((seed * (platform + 3) + platform * 17) % 67) + trainsOnPlatform.length * 9, 8, 99);
    return {
      platform,
      level: congestionLevel(densityPercent),
      densityPercent,
      estimatedPassengers: Math.round(densityPercent * 3.2 + trainsOnPlatform.length * 48),
      trainNumbers: trainsOnPlatform.map((train) => train.number),
    };
  });
  const estimatedPassengers = platforms.reduce((total, platform) => total + platform.estimatedPassengers, 0);
  const averageDensity = platforms.reduce((total, platform) => total + platform.densityPercent, 0) / platformCount;

  return {
    stationId: station.id,
    level: congestionLevel(averageDensity),
    estimatedPassengers,
    incomingTrains,
    outgoingTrains,
    platforms,
  };
}

export function coachOccupancies(train: Train): CoachOccupancy[] {
  const offsets = [14, -9, -24, 5, 10, -16, 2, 18, -12, 7, -5, 11];
  return Array.from({ length: Math.max(1, train.coaches) }, (_, index) => {
    const occupancyPercent = bounded(train.occupancy + offsets[index % offsets.length], 0, 100);
    const level = occupancyPercent >= 90
      ? "Overcrowded"
      : occupancyPercent >= 75
        ? "High"
        : occupancyPercent >= 50
          ? "Moderate"
          : "Available";
    return {
      coach: `${train.type === "Rajdhani" ? "A" : "S"}${index + 1}`,
      occupancyPercent,
      level,
    };
  });
}

function durationInMinutes(duration: string) {
  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  return Number(hours ?? 0) * 60 + Number(minutes ?? 0);
}

export function optimizeRoute(train: Train, allTrains: Train[]): RouteAlternative[] {
  const stopIds = train.stops.map((stop) => stop.stationId);
  const sharedTrainCount = allTrains.filter(
    (other) => other.id !== train.id && other.stops.some((stop) => stopIds.includes(stop.stationId)),
  ).length;
  const waypoints = ["BPL", "AGC", "KOTA", "CNB", "NGP", "ADI", "LKO", "ALD", "JP", "BZA", "PNBE", "MMCT", "CSMT", "HWH", "MAS"]
    .filter((stationId) => stationId !== train.from && stationId !== train.to && !stopIds.includes(stationId))
    .slice(0, 2);
  const candidates = [
    { id: "original", label: "Current corridor", waypointId: null, addedMinutes: 0, delay: train.delayMinutes },
    ...waypoints.map((waypointId, index) => {
      const station = mockStations.find((item) => item.id === waypointId);
      const delayReduction = 12 + index * 10;
      return {
        id: `scenario-${index + 1}`,
        label: `Scenario via ${station?.name ?? waypointId}`,
        waypointId,
        addedMinutes: 22 + index * 16,
        delay: Math.max(0, train.delayMinutes - delayReduction),
      };
    }),
  ];
  const options = candidates.map((candidate) => {
    const routeIds = candidate.waypointId ? [...new Set([train.from, candidate.waypointId, train.to])] : stopIds;
    const affectedTrains = allTrains
      .filter((other) => other.id !== train.id && other.stops.some((stop) => routeIds.includes(stop.stationId)))
      .map((other) => other.number);
    const affectedStations = routeIds.length;
    const durationMinutes = durationInMinutes(train.duration) + candidate.addedMinutes;
    const score = durationMinutes + candidate.delay * 1.5 + affectedTrains.length * 3;
    return {
      id: candidate.id,
      label: candidate.label,
      waypointId: candidate.waypointId,
      durationMinutes,
      predictedDelayMinutes: candidate.delay,
      affectedStations,
      affectedTrains,
      rationale: candidate.waypointId
        ? `Illustrative alternative via ${candidate.waypointId}; compare added travel time against the simulated delay reduction.`
        : `Existing mock corridor with ${sharedTrainCount} potential bottleneck indicators from services sharing listed stations.`,
      recommended: false,
      score,
    };
  });
  const best = Math.min(...options.map((option) => option.score));
  return options.map(({ score, ...option }) => ({ ...option, recommended: score === best }));
}

export function incidentSeverityColor(severity: IncidentSeverity) {
  const colors: Record<IncidentSeverity, string> = {
    Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    High: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    Critical: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };
  return colors[severity];
}
