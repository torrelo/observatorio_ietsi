import { UserRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { CrisResearcher } from "@/lib/researchers";

export function ResearcherProfileCard({ researcher }: { researcher: CrisResearcher }) {
  const researchLinesToShow = 2;
  const additionalLines = Math.max(0, researcher.researchLines.length - researchLinesToShow);
  const displayedLines = researcher.researchLines.slice(0, researchLinesToShow);
  const ellipsisClamp2: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand">
          <UserRound size={40} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="min-h-[3rem] overflow-hidden" style={ellipsisClamp2}>
            <p className="text-lg font-bold leading-tight text-slate-950 hover:text-brand">{researcher.fullName}</p>
          </div>
          <div className="mt-2 h-5 overflow-hidden">
            <p className="text-sm text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">{researcher.specialty}</p>
          </div>
          <div className="mt-2 h-10 overflow-hidden">
            <p className="text-sm font-semibold text-brand-dark" style={ellipsisClamp2}>
              {researcher.mainUnit}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[2.5rem] flex flex-wrap gap-2">
        {researcher.externalIds.orcid ? <Badge tone="sky">ORCID {researcher.externalIds.orcid}</Badge> : null}
        {researcher.renacytCategory ? <Badge>{researcher.renacytCategory}</Badge> : <Badge tone="gray">Sin RENACYT</Badge>}
      </div>

      <div className="mt-3 min-h-[3rem] overflow-hidden">
        <div className="flex flex-wrap gap-2">
          {displayedLines.map((line) => (
            <Badge key={line} tone="gray">
              {line}
            </Badge>
          ))}
          {additionalLines > 0 && <Badge tone="gray">+{additionalLines}</Badge>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
        <Metric label="Publicaciones" value={researcher.metrics.publications} />
        <Metric label="Citas" value={researcher.metrics.citations} />
        <Metric label="H-index" value={researcher.metrics.hIndex} />
        <Metric label="Proyectos" value={researcher.metrics.activeProjects + researcher.metrics.finishedProjects} />
        <Metric label="Ensayos" value={researcher.metrics.clinicalTrials} />
        <Metric label="Colab. int." value={researcher.metrics.internationalCollaborations} />
      </div>

      <div className="mt-4 flex-1" />
      <Link className="rounded bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark" href={`/investigadores/${researcher.id}`}>
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
