"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DirectoryLoading() {
  return <section className="site-container py-8" aria-busy="true"><h1 className="page-heading">Cargando directorio</h1><p role="status" className="mt-4 text-slate-600">Consultando la base institucional…</p></section>;
}

export function DirectoryError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending,startTransition] = useTransition();
  return <section className="site-container py-8"><h1 className="page-heading">No se pudo cargar el directorio</h1><p role="alert" className="mt-4 max-w-3xl text-slate-600">La consulta no está disponible en este momento. Conservamos la búsqueda en la dirección de la página. Puedes reintentar sin volver a introducirla.</p><button disabled={pending} aria-busy={pending} onClick={() => startTransition(() => { router.refresh(); reset(); })} className="action-control mt-5 rounded bg-brand px-4 font-semibold text-white">{pending ? "Reintentando…" : "Reintentar"}</button></section>;
}
