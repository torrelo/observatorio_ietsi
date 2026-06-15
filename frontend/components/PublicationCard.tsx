import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { Publication } from "@/lib/types";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{publication.quartile}</Badge>
        <Badge tone={publication.open_access ? "green" : "gray"}>{publication.open_access ? "Acceso abierto" : "Suscripcion"}</Badge>
        <Badge tone="sky">{publication.year}</Badge>
      </div>
      <Link href={`/publicaciones/${publication.id}`} className="mt-3 block text-lg font-bold leading-snug text-slate-950 hover:text-brand">
        {publication.title}
      </Link>
      <p className="mt-2 text-sm text-slate-600">{publication.authors.join(", ")}</p>
      <p className="mt-2 text-sm font-medium text-brand-dark">{publication.journal}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <span><strong>{publication.citations}</strong><br />citas</span>
        <span><strong>{publication.altmetrics}</strong><br />altmetrics</span>
        <span><strong>{publication.impact_factor ?? "N/D"}</strong><br />impacto</span>
      </div>
    </article>
  );
}
