"use client";

import Link from "next/link";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand-sky">Error de carga</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">No se pudo cargar esta vista</h1>
      <p className="mt-3 text-slate-600">
        La aplicacion encontro un problema temporal al renderizar el modulo solicitado.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" type="button" onClick={reset}>
          Reintentar
        </button>
        <Link className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-dark" href="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
