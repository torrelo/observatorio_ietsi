export default function PublicationLoading() {
  return <section className="site-container min-h-[32rem] py-10" aria-busy="true" aria-label="Cargando publicaciones"><p role="status" className="font-semibold text-brand-dark">Cargando el directorio de producción científica…</p><div className="mt-6 space-y-4" aria-hidden="true">{[1, 2, 3].map(key => <div key={key} className="h-28 rounded-lg border border-slate-200 bg-white" />)}</div></section>;
}
