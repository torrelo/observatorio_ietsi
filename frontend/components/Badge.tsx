import type { ReactNode } from "react";

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "sky" | "green" | "gray" }) {
  const tones = {
    blue: "bg-brand-pale text-brand-dark",
    sky: "bg-cyan-50 text-cyan-700",
    green: "bg-emerald-50 text-emerald-700",
    gray: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
