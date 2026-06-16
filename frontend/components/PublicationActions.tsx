"use client";

import { Copy, Download, ExternalLink, FileText } from "lucide-react";
import type { ScientificPublication } from "@/lib/publications";
import { createTextDataHref, getPublicationPdfPlaceholder, publicationToBibtex, publicationToRis } from "@/lib/publicationExports";

export function PublicationActions({ publication }: { publication: ScientificPublication }) {
  const doiUrl = publication.doi ? `https://doi.org/${publication.doi}` : "#";
  const pmidUrl = publication.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}` : "#";

  async function copyDoi() {
    if (publication.doi) {
      await navigator.clipboard.writeText(publication.doi);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" type="button">
        <FileText size={16} /> Citar
      </button>
      <a className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" href={createTextDataHref(publicationToRis(publication))} download={`publicacion-${publication.id}.ris`}>
        <Download size={16} /> Exportar RIS
      </a>
      <a className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" href={createTextDataHref(publicationToBibtex(publication))} download={`publicacion-${publication.id}.bib`}>
        <Download size={16} /> Exportar BibTeX
      </a>
      <button className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="button" onClick={copyDoi}>
        <Copy size={16} /> Copiar DOI
      </button>
      <a className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${publication.pmid ? "bg-brand-pale text-brand-dark" : "bg-slate-100 text-slate-400"}`} href={pmidUrl}>
        <ExternalLink size={16} /> Ver en PubMed
      </a>
      <a className="inline-flex items-center gap-2 rounded bg-brand-pale px-3 py-2 text-sm font-semibold text-brand-dark" href={doiUrl}>
        <ExternalLink size={16} /> Ver en Crossref
      </a>
      <a className="inline-flex items-center gap-2 rounded bg-brand-pale px-3 py-2 text-sm font-semibold text-brand-dark" href={`https://openalex.org/${publication.external_identifiers?.openalex_id ?? ""}`}>
        <ExternalLink size={16} /> Ver en OpenAlex
      </a>
      <a className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" href={getPublicationPdfPlaceholder(publication)} download={`ficha-publicacion-${publication.id}.txt`}>
        <Download size={16} /> Descargar ficha PDF
      </a>
    </div>
  );
}
