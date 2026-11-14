import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { displayValue, type ScientificPublication } from "@/lib/publications";

type Availability = { citations: number | null; openAccess: boolean | null; altmetric: number | null };
const number = (value: number) => value.toLocaleString("es-PE");

export function PublicationResult({ publication: p, available, returnTo }: { publication: ScientificPublication; available?: Availability; returnTo: string }) {
  const detail = `/produccion-cientifica/${p.id}?returnTo=${encodeURIComponent(returnTo)}`;
  const authors = p.authors.length ? p.authors : p.institutional_authors ?? [];
  const rawDoi = p.doi?.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").trim();
  const doi = rawDoi && /^10\.\d{4,9}\/\S+$/i.test(rawDoi) ? `https://doi.org/${encodeURI(rawDoi).replaceAll("#", "%23").replaceAll("?", "%3F")}` : null;
  const pmid = p.pmid && /^\d+$/.test(p.pmid) ? `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/` : null;
  const access = available?.openAccess;
  const review = /requires_manual_review|needs_review|pending|pendiente|preliminar/i.test(p.study_type_review_status ?? "");
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-medium text-slate-600">{displayValue(p.journal?.name, "Fuente no disponible")} <span aria-hidden="true">·</span> {p.year || "Año no disponible"}</p>
      <h3 className="mt-2 text-lg font-bold leading-snug text-brand-dark sm:text-xl"><Link className="hover:underline" href={detail}>{p.title}</Link></h3>
      <div className="mt-3 text-sm leading-6 text-slate-700">
        <p>{authors.length ? authors.slice(0, 3).map(author => author.name).join(", ") : "Autoría no disponible"}</p>
        {authors.length > 3 ? <details className="mt-1"><summary className="action-control cursor-pointer justify-start text-sm font-semibold text-brand">Ver {number(authors.length - 3)} autores más</summary><p className="mt-1">{authors.slice(3).map(author => author.name).join(", ")}</p></details> : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <span>{displayValue(p.publication_type_label ?? p.publication_type)}</span>
        <Badge tone={access === true ? "green" : "gray"}>{access == null ? "Acceso no disponible" : access ? "Acceso abierto" : "Restringido"}</Badge>
        {p.quartile ? <Badge>{p.quartile}</Badge> : <span>Sin información de cuartil</span>}
        <span>{available?.citations == null ? "Citas no disponibles" : `${number(available.citations)} citas`}</span>
      </div>
      {review ? <p className="mt-3 text-sm text-amber-800">Clasificación temática en revisión</p> : null}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {doi ? <a className="action-control gap-1 text-brand underline" href={doi} target="_blank" rel="noopener noreferrer">DOI: {rawDoi}<ExternalLink size={14} className="shrink-0" aria-hidden="true" /><span className="sr-only"> (abre otra pestaña)</span></a> : null}
        {pmid ? <a className="action-control gap-1 text-brand underline" href={pmid} target="_blank" rel="noopener noreferrer">PMID: {p.pmid}<ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (abre otra pestaña)</span></a> : null}
      </div>
      <details className="mt-2 text-sm text-slate-600">
        <summary className="action-control cursor-pointer justify-start font-semibold text-brand">Más información bibliográfica</summary>
        <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {[["Tipo de estudio", p.study_type], ["Área temática", p.thematic_area], ["ISSN", p.journal?.issn], ["Fuente del registro", p.source], ["Altmetric", available?.altmetric == null ? undefined : String(available.altmetric)]].map(([label, value]) => <div key={label}><dt className="font-semibold text-slate-700">{label}</dt><dd>{displayValue(value)}</dd></div>)}
        </dl>
        {p.keywords.length ? <p className="mt-3"><strong>Palabras clave y clasificación: </strong>{p.keywords.map(keyword => keyword.term).join(" · ")}</p> : null}
        {!doi ? <p className="mt-2">{p.doi ? `DOI registrado sin enlace validado: ${p.doi}` : "Sin DOI disponible"}</p> : null}
        {!pmid ? <p className="mt-2">{p.pmid ? `PMID registrado sin enlace validado: ${p.pmid}` : "Sin PMID disponible"}</p> : null}
      </details>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
        <Link className="action-control rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={detail}>Ver detalle</Link>
        {doi ? <a className="action-control gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-brand" href={doi} target="_blank" rel="noopener noreferrer">Ver publicación<ExternalLink size={16} aria-hidden="true" /><span className="sr-only"> (abre otra pestaña)</span></a> : null}
      </div>
    </article>
  );
}
