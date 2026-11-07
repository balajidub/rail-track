"use client";

import dynamic from "next/dynamic";

export const RailwayMap = dynamic(() => import("./RailwayMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-[#07101f] text-sm text-slate-400">
      Synchronizing track map…
    </div>
  ),
});
