"use client";

import { useRailTrack } from "@/context/RailTrackContext";
import { Bell, Menu, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function TopNav() {
  const {
    query,
    setQuery,
    setView,
    setSidebarOpen,
    unreadCount,
    alerts,
    markAlertRead,
    markAllRead,
    clock,
    settings,
  } = useRailTrack();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cyan-400/10 bg-[#08101f]/80 px-4 py-3 backdrop-blur-xl lg:px-6">
      <button
        type="button"
        className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setView("trains");
          }}
          placeholder="Search trains, stations or corridors"
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/10"
        />
      </div>

      <div className="hidden items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-300 md:flex">
        <ShieldCheck className="size-3.5" />
        IST {clock}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-semibold text-slate-950">
              {unreadCount}
            </span>
          ) : null}
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0b1428] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <p className="text-sm font-medium text-white">Delay desk</p>
                <button type="button" className="text-xs text-cyan-300" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.slice(0, 6).map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => markAlertRead(alert.id)}
                    className="block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-slate-100">{alert.title}</p>
                      {!alert.read ? <span className="size-1.5 rounded-full bg-cyan-400" /> : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{alert.message}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{alert.time}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setView("settings")}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3"
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-semibold text-slate-950">
          {settings.operatorName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-white">{settings.operatorName}</span>
          <span className="block text-[11px] text-slate-400">Network engineer</span>
        </span>
      </button>
    </header>
  );
}
