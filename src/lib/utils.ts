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
  const station = stationById(stations, train.currentStationId);
  return station ? { lat: station.lat, lng: station.lng } : null;
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
