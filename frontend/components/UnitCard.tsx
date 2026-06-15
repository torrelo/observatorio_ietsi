import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { ResearchUnit } from "@/lib/types";

export function UnitCard({ unit }: { unit: ResearchUnit }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{unit.status}</Badge>
        <Badge tone="sky">Ranking #{unit.internal_ranking}</Badge>
      </div>
      <Link href={`/unidades/${unit.id}`} className="mt-3 block text-lg font-bold leading-snug text-slate-950 hover:text-brand">
        {unit.name}
      </Link>
      <p className="mt-2 text-sm text-slate-600">{unit.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <span><strong>{unit.publications}</strong><br />publicaciones</span>
        <span><strong>{unit.projects}</strong><br />proyectos</span>
        <span><strong>{unit.clinical_trials}</strong><br />ensayos</span>
      </div>
    </article>
  );
}
