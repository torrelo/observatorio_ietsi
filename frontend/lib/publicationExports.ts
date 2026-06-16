import type { ScientificPublication } from "@/lib/publications";

export function publicationToCsvRow(publication: ScientificPublication) {
  return [
    publication.title,
    publication.authors.map((author) => author.name).join("; "),
    publication.year,
    publication.journal?.name ?? "",
    publication.doi ?? "",
    publication.pmid ?? "",
    publication.quartile ?? "",
    publication.citation_count,
  ];
}

export function publicationToRis(publication: ScientificPublication) {
  return [
    "TY  - JOUR",
    `TI  - ${publication.title}`,
    ...publication.authors.map((author) => `AU  - ${author.name}`),
    `PY  - ${publication.year}`,
    `JO  - ${publication.journal?.name ?? ""}`,
    publication.doi ? `DO  - ${publication.doi}` : "",
    publication.pmid ? `AN  - ${publication.pmid}` : "",
    "ER  -",
  ].filter(Boolean).join("\n");
}

export function publicationToBibtex(publication: ScientificPublication) {
  const key = `essalud${publication.year}${publication.id}`;
  return `@article{${key},
  title = {${publication.title}},
  author = {${publication.authors.map((author) => author.name).join(" and ")}},
  journal = {${publication.journal?.name ?? ""}},
  year = {${publication.year}},
  doi = {${publication.doi ?? ""}},
  pmid = {${publication.pmid ?? ""}}
}`;
}

export function createTextDataHref(content: string, mime = "text/plain") {
  return `data:${mime};charset=utf-8,${encodeURIComponent(content)}`;
}

// Future work: replace this placeholder with a server-side PDF renderer once
// institutional templates and signatures are approved.
export function getPublicationPdfPlaceholder(publication: ScientificPublication) {
  return createTextDataHref(`Ficha bibliografica\n\n${publication.title}`, "text/plain");
}
