"use client";

import { RailTrackProvider } from "@/context/RailTrackContext";
import { AppShell } from "@/components/layout/AppShell";

export function RailTrackApp() {
  return (
    <RailTrackProvider>
      <AppShell />
    </RailTrackProvider>
  );
}
