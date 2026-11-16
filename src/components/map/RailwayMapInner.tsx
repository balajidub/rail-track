"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { formatDelay, stationById, trainPosition } from "@/lib/utils";
import type { Station, TrainStatus } from "@/types/railway";
import { LocateFixed, ScanSearch } from "lucide-react";
import { useEffect } from "react";
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

  useEffect(() => {
    if (trainId) {
      map.flyTo([lat, lng], 6.2, { duration: 0.85 });
    }
  }, [trainId, lat, lng, map]);

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
  const { filteredTrains, stations, selectedTrain, selectTrain, setView } = useRailTrack();
  const selectedPosition = selectedTrain ? trainPosition(selectedTrain, stations) : null;

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
        {selectedTrain && selectedPosition ? (
          <FlyToSelection
            trainId={selectedTrain.id}
            lat={selectedPosition.lat}
            lng={selectedPosition.lng}
          />
        ) : null}
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
          const position = trainPosition(train, stations);
          if (!position) return null;
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
                  <div>Last reported station: {current?.name ?? "—"}</div>
                  <div>Next listed stop: {next?.name ?? "—"}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <TrainStatusLegend />
    </div>
  );
}
