"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { formatDelay, stationById, trainPosition } from "@/lib/utils";
import type { Station, Train, TrainStatus } from "@/types/railway";
import { LocateFixed, ScanSearch } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const statusColors: Record<TrainStatus, string> = {
  "on-time": "#34d399",
  delayed: "#fbbf24",
  cancelled: "#fb7185",
  arrived: "#60a5fa",
};

const INDIA_CENTER: [number, number] = [22.8, 79.2];
type Position = { lat: number; lng: number };

function positionsForTrains(trains: Train[], stations: Station[]): Record<string, Position> {
  return Object.fromEntries(
    trains.map((train) => [train.id, trainPosition(train, stations)]),
  );
}

function FlyToSelection({
  trainId,
  lat,
  lng,
}: {
  trainId: string | null;
  lat: number;
  lng: number;
}) {
  const map = useMap();
  const position = useRef<[number, number]>([lat, lng]);

  useEffect(() => {
    position.current = [lat, lng];
  }, [lat, lng]);

  useEffect(() => {
    if (trainId) {
      map.flyTo(position.current, 6.2, { duration: 0.85 });
    }
  }, [trainId, map]);

  return null;
}

function MapActions({ stations }: { stations: Station[] }) {
  const map = useMap();

  const recenter = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    map.flyTo(INDIA_CENTER, 5, { duration: 0.8 });
  };

  const fitStations = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (stations.length === 0) return;
    map.fitBounds(
      stations.map((station) => [station.lat, station.lng] as [number, number]),
      { padding: [36, 36], maxZoom: 6 },
    );
  };

  return (
    <div className="leaflet-map-actions" aria-label="Map controls">
      <button type="button" onClick={recenter} title="Recenter on India" aria-label="Recenter on India">
        <LocateFixed className="size-4" />
      </button>
      <button type="button" onClick={fitStations} title="Fit all stations" aria-label="Fit all stations">
        <ScanSearch className="size-4" />
      </button>
    </div>
  );
}

function useAnimatedTrainPositions(trains: Train[], stations: Station[]) {
  const initialPositions = useMemo(
    () => positionsForTrains(trains, stations),
    [trains, stations],
  );
  const [positions, setPositions] = useState(initialPositions);
  const positionsRef = useRef(initialPositions);

  useEffect(() => {
    const starts = Object.fromEntries(
      trains.map((train) => [
        train.id,
        positionsRef.current[train.id] ?? trainPosition(train, stations),
      ]),
    );
    const targets = positionsForTrains(trains, stations);
    const startedAt = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 2600, 1);
      const next = Object.fromEntries(
        trains.map((train) => {
          const start = starts[train.id];
          const target = targets[train.id];
          return [
            train.id,
            {
              lat: start.lat + (target.lat - start.lat) * progress,
              lng: start.lng + (target.lng - start.lng) * progress,
            },
          ];
        }),
      );
      positionsRef.current = next;
      setPositions(next);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [trains, stations]);

  return positions;
}

function TrainStatusLegend() {
  const entries: Array<{ status: TrainStatus; label: string }> = [
    { status: "on-time", label: "On time" },
    { status: "delayed", label: "Delayed" },
    { status: "cancelled", label: "Cancelled" },
    { status: "arrived", label: "Arrived" },
  ];

  return (
    <div className="leaflet-map-legend" aria-label="Train status legend">
      {entries.map(({ status, label }) => (
        <span key={status}>
          <i style={{ backgroundColor: statusColors[status] }} />
          {label}
        </span>
      ))}
    </div>
  );
}

export default function RailwayMapInner({ tall = false }: { tall?: boolean }) {
  const { trains, filteredTrains, stations, selectedTrain, selectTrain, setView } = useRailTrack();
  const positions = useAnimatedTrainPositions(trains, stations);
  const selectedPosition = selectedTrain
    ? positions[selectedTrain.id] ?? trainPosition(selectedTrain, stations)
    : { lat: INDIA_CENTER[0], lng: INDIA_CENTER[1] };

  return (
    <div
      className={
        tall
          ? "relative h-[min(70vh,680px)] min-h-[420px] overflow-hidden rounded-2xl"
          : "relative h-[360px] overflow-hidden rounded-2xl sm:h-[400px] lg:h-[420px]"
      }
    >
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelection
          trainId={selectedTrain?.id ?? null}
          lat={selectedPosition.lat}
          lng={selectedPosition.lng}
        />
        <MapActions stations={stations} />

        {stations.map((station) => (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            radius={4}
            pathOptions={{
              color: "#67e8f9",
              weight: 1.5,
              fillColor: "#0e7490",
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>{station.name}</Tooltip>
            <Popup>
              <strong>{station.name}</strong>
              <div>{station.code} · {station.zone}</div>
              <div>{station.city}, {station.state}</div>
            </Popup>
          </CircleMarker>
        ))}

        {filteredTrains.map((train) => {
          const route = train.stops
            .map((stop) => stationById(stations, stop.stationId))
            .filter((station): station is Station => Boolean(station))
            .map((station) => [station.lat, station.lng] as [number, number]);
          const selected = train.id === selectedTrain?.id;

          return (
            <Polyline
              key={`${train.id}-route`}
              positions={route}
              pathOptions={{
                color: statusColors[train.status],
                weight: selected ? 4 : 2,
                opacity: selected ? 0.95 : 0.48,
                dashArray: train.status === "cancelled" ? "5 7" : undefined,
              }}
              eventHandlers={{ click: () => selectTrain(train.id) }}
            />
          );
        })}

        {filteredTrains.map((train) => {
          const position = positions[train.id] ?? trainPosition(train, stations);
          const selected = train.id === selectedTrain?.id;
          const current = stationById(stations, train.currentStationId);
          const next = stationById(stations, train.nextStationId);
          const color = statusColors[train.status];

          return (
            <CircleMarker
              key={train.id}
              center={[position.lat, position.lng]}
              radius={selected ? 10 : 7}
              pathOptions={{
                color: selected ? "#f8fafc" : color,
                fillColor: color,
                fillOpacity: 0.95,
                weight: selected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  selectTrain(train.id);
                  setView("tracking");
                },
              }}
            >
              <Popup>
                <div className="min-w-44 space-y-1">
                  <strong>{train.number} · {train.name}</strong>
                  <div className="capitalize">{train.status.replace("-", " ")}</div>
                  <div>{train.speed} km/h · {formatDelay(train.delayMinutes)}</div>
                  <div>Near {current?.name ?? "route"} · next {next?.name ?? "—"}</div>
                  <div>{Math.round(train.progress * 100)}% route progress</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <TrainStatusLegend />
      <span className="leaflet-demo-label">DEMO SIMULATION</span>
    </div>
  );
}
