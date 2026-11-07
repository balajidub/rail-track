import { cn } from "@/lib/utils";
import type { TrainStatus } from "@/types/railway";

const labels: Record<TrainStatus, string> = {
  "on-time": "On time",
  delayed: "Delayed",
  cancelled: "Cancelled",
  arrived: "Arrived",
};

export function StatusBadge({ status, compact = false }: { status: TrainStatus; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        status === "on-time" && "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
        status === "delayed" && "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/25",
        status === "cancelled" && "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/25",
        status === "arrived" && "bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "on-time" && "bg-emerald-400 shadow-[0_0_8px_#34d399]",
          status === "delayed" && "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
          status === "cancelled" && "bg-rose-400",
          status === "arrived" && "bg-sky-400",
        )}
      />
      {labels[status]}
    </span>
  );
}
