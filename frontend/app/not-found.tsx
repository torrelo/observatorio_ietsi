import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-8">
      <p className="text-sm font-bold uppercase tracking-wide text-brand-sky">Ruta no encontrada</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">La pagina solicitada no existe</h1>
      <p className="mt-3 text-slate-600">
        Verifica la direccion o vuelve al portal principal del Observatorio Nacional de Investigacion de EsSalud.
      </p>
      <Link className="mt-6 inline-flex rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href="/">
        Volver al inicio
      </Link>
    </section>
  );
}
