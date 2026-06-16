import { UserRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { CrisResearcher } from "@/lib/researchers";

export function ResearcherProfileCard({ researcher }: { researcher: CrisResearcher }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand">
          <UserRound size={40} />
        </div>
        <div className="min-w-0">
          <Link href={`/investigadores/${researcher.id}`} className="text-lg font-bold leading-snug text-slate-950 hover:text-brand">
            {researcher.fullName}
          </Link>
          <p className="mt-1 text-sm text-slate-600">{researcher.specialty}</p>
          <p className="mt-1 text-sm font-semibold text-brand-dark">{researcher.mainUnit}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {researcher.externalIds.orcid ? <Badge tone="sky">ORCID {researcher.externalIds.orcid}</Badge> : null}
        {researcher.renacytCategory ? <Badge>{researcher.renacytCategory}</Badge> : <Badge tone="gray">Sin RENACYT</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {researcher.researchLines.slice(0, 3).map((line) => <Badge key={line} tone="gray">{line}</Badge>)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
        <Metric label="Publicaciones" value={researcher.metrics.publications} />
        <Metric label="Citas" value={researcher.metrics.citations} />
        <Metric label="H-index" value={researcher.metrics.hIndex} />
        <Metric label="Proyectos" value={researcher.metrics.activeProjects + researcher.metrics.finishedProjects} />
        <Metric label="Ensayos" value={researcher.metrics.clinicalTrials} />
        <Metric label="Colab. int." value={researcher.metrics.internationalCollaborations} />
      </div>

      <Link className="mt-4 inline-flex rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark" href={`/investigadores/${researcher.id}`}>
        Ver perfil
      </Link>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 p-2">
      <p className="font-bold text-brand-dark">{value}</p>
      <p>{label}</p>
    </div>
  );
}
