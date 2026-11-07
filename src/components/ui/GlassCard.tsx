import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl",
        padding && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
