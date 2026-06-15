export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-600 md:grid-cols-3 lg:px-8">
        <p className="font-semibold text-brand-dark">Observatorio Nacional de Investigacion de EsSalud</p>
        <p>Preparado para integraciones con OpenSearch, ORCID, Crossref, OpenAlex, PubMed, Scopus y DSpace.</p>
        <p className="md:text-right">MVP institucional - IETSI</p>
      </div>
    </footer>
  );
}
