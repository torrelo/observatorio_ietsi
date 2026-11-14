"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function PublicationError({ reset }: { error: Error; reset: () => void }) {
  const query = useSearchParams().get("q");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <section className="site-container min-h-[24rem] py-10" aria-busy={pending}>
    <h1 className="page-heading font-bold text-slate-950">No se pudo consultar el catálogo</h1>
    <p role="alert" className="mt-4 max-w-2xl text-slate-600">Ocurrió un problema al cargar los datos. Tu consulta y filtros siguen guardados en la dirección de esta página.</p>
    {query ? <p className="mt-3 text-sm text-slate-600">Consulta conservada: {query}</p> : null}
    <button type="button" disabled={pending} onClick={() => startTransition(() => { router.refresh(); reset(); })} className="action-control mt-6 rounded bg-brand px-5 font-semibold text-white">{pending ? "Reintentando…" : "Reintentar"}</button>
  </section>;
}
