"use client";

import { Copy, Download, ExternalLink, FileText } from "lucide-react";
import type { ReactNode } from "react";
import type { ScientificPublication } from "@/lib/publications";
import { createTextDataHref, getPublicationPdfPlaceholder, publicationToBibtex, publicationToRis } from "@/lib/publicationExports";

export function PublicationActions({ publication }: { publication: ScientificPublication }) {
  const doiUrl = publication.doi ? `https://doi.org/${publication.doi}` : "#";
  const pmidUrl = publication.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}` : "#";
  const openAlexUrl = `https://openalex.org/${publication.external_identifiers?.openalex_id ?? ""}`;

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
      <button className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-semibold text-white" type="button" onClick={copyDoi}>
        <Copy size={16} /> Copiar DOI
      </button>
      <ActionMenu label="Exportar" icon={<Download size={16} />}>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href={createTextDataHref(publicationToRis(publication))} download={`publicacion-${publication.id}.ris`}>RIS</a>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href={createTextDataHref(publicationToBibtex(publication))} download={`publicacion-${publication.id}.bib`}>BibTeX</a>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href={getPublicationPdfPlaceholder(publication)} download={`ficha-publicacion-${publication.id}.txt`}>PDF</a>
      </ActionMenu>
      <ActionMenu label="Ver publicación" icon={<ExternalLink size={16} />}>
        <a className={`block rounded px-3 py-2 hover:bg-brand-pale ${publication.pmid ? "" : "text-slate-400"}`} href={pmidUrl}>PubMed</a>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href={doiUrl}>Crossref</a>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href={openAlexUrl}>OpenAlex</a>
        <a className="block rounded px-3 py-2 hover:bg-brand-pale" href="#">DSpace institucional</a>
      </ActionMenu>
    </div>
  );
}

function ActionMenu({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 marker:hidden">
        {icon}
        {label} ▼
      </summary>
      <div className="absolute left-0 z-20 mt-2 min-w-44 rounded-lg border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 shadow-lg">
        {children}
      </div>
    </details>
  );
}
