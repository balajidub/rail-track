import type { Station, Stop, Train } from "@/types/railway";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDelay(minutes: number) {
  if (minutes <= 0) return "On time";
  if (minutes < 60) return `+${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `+${hours}h ${rest}m` : `+${hours}h`;
}

export function stationById(stations: Station[], id: string) {
  return stations.find((station) => station.id === id);
}

export function trainPosition(train: Train, stations: Station[]) {
  const points = train.stops
    .map((stop) => stationById(stations, stop.stationId))
    .filter((station): station is Station => Boolean(station))
    .map((station) => ({ lat: station.lat, lng: station.lng }));

  return interpolate(points, train.progress);
}

export function interpolate(
  points: Array<{ lat: number; lng: number }>,
  t: number,
) {
  if (points.length === 0) return { lat: 22.5, lng: 79 };
  if (points.length === 1) return points[0];

  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const fraction = scaled - index;
  const start = points[index];
  const end = points[index + 1];

  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction,
  };
}

export function currentAndNextStop(train: Train) {
  const total = Math.max(train.stops.length - 1, 1);
  const index = Math.min(Math.floor(train.progress * total), train.stops.length - 1);
  return {
    current: train.stops[index],
    next: train.stops[Math.min(index + 1, train.stops.length - 1)],
  };
}

export function etaForTrain(train: Train) {
  if (train.status === "arrived") return train.arrival;
  const [hours, minutes] = train.arrival.split(":").map(Number);
  const delayed = hours * 60 + minutes + Math.max(train.delayMinutes, 0);
  const hh = Math.floor((delayed / 60) % 24)
    .toString()
    .padStart(2, "0");
  const mm = Math.floor(delayed % 60)
    .toString()
    .padStart(2, "0");
  return `${hh}:${mm}`;
}

export function matchesQuery(train: Train, stations: Station[], query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return true;

  const origin = stationById(stations, train.from);
  const destination = stationById(stations, train.to);
  const haystack = [
    train.number,
    train.name,
    train.type,
    origin?.name,
    origin?.city,
    origin?.code,
    destination?.name,
    destination?.city,
    destination?.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(value);
}

export function journeysBetween(trains: Train[], fromId: string, toId: string) {
  return trains.filter((train) => {
    const fromIndex = train.stops.findIndex((stop) => stop.stationId === fromId);
    const toIndex = train.stops.findIndex((stop) => stop.stationId === toId);
    return fromIndex >= 0 && toIndex > fromIndex;
  });
}

export function trainsAtStation(trains: Train[], stationId: string) {
  return trains.filter((train) => {
    const onRoute = train.stops.some((stop) => stop.stationId === stationId);
    if (!onRoute) return false;
    return train.currentStationId === stationId || train.nextStationId === stationId;
  });
}

export function stopLabel(stop: Stop, stations: Station[]) {
  return stationById(stations, stop.stationId)?.name ?? stop.stationId;
}
