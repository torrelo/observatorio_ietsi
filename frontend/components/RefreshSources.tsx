"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RefreshSources() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} aria-busy={pending} className="action-control mt-3 rounded border border-brand px-4 text-sm font-semibold text-brand" onClick={() => startTransition(() => router.refresh())}>{pending ? "Consultando fuentes…" : "Reintentar fuentes"}</button>;
}
