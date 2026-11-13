import { UserRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { displayOrcid, orcidHref } from "@/lib/researchers";
import type { CrisResearcher } from "@/lib/researchers";

export function ResearcherProfileCard({ researcher }: { researcher: CrisResearcher }) {
  const researchLinesToShow = 2;
  const additionalLines = Math.max(0, researcher.researchLines.length - researchLinesToShow);
  const displayedLines = researcher.researchLines.slice(0, researchLinesToShow);

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <ResearcherAvatar researcher={researcher} size="sm" />
        <div className="min-w-[min(100%,10rem)] flex-1">
          <h2 className="text-lg font-bold leading-snug text-slate-950">{researcher.fullName}</h2>
          <p className="mt-2 text-sm text-slate-600">{researcher.profile.primaryInstitution}</p>
          <p className="mt-2 text-sm font-semibold text-brand-dark">{researcher.profile.primaryAffiliationNormalized}</p>
        </div>
      </div>

      <div className="mt-3 min-h-[2.5rem] flex flex-wrap gap-2">
        {orcidHref(researcher.externalIds.orcid) ? <Badge tone="sky">ORCID {displayOrcid(researcher.externalIds.orcid)}</Badge> : <Badge tone="gray">Sin ORCID</Badge>}
        {researcher.metrics.q1 > 0 ? <Badge>Q1: {researcher.metrics.q1}</Badge> : <Badge tone="gray">Sin Q1</Badge>}
      </div>

      <div className="mt-3 min-h-[3rem]">
        <div className="flex flex-wrap gap-2">
          {displayedLines.map((line) => (
            <Badge key={line} tone="gray">
              {line}
            </Badge>
          ))}
          {additionalLines > 0 && <Badge tone="gray">+{additionalLines}</Badge>}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),1fr))] gap-2 text-center text-xs text-slate-500">
        <Metric label="Publicaciones" value={researcher.metrics.publications} />
        <Metric label="Citas" value={researcher.metrics.citations} />
        <Metric label="H-index obs." value={researcher.metrics.hIndex} />
        <Metric label="Q1" value={researcher.metrics.q1} />
        <Metric label="OA" value={researcher.metrics.openAccess} />
        <Metric label="Años activos" value={researcher.metrics.activeYears} />
      </div>

      <div className="mt-4 flex-1" />
      <Link className="action-control rounded bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark" href={`/investigadores/${encodeURIComponent(researcher.id)}`}>
        Ver perfil
      </Link>
    </article>
  );
}

function ResearcherAvatar({ researcher, size }: { researcher: CrisResearcher; size: "sm" }) {
  const className = size === "sm" ? "h-20 w-20 text-xl" : "h-24 w-24 text-2xl";
  if (researcher.photoUrl) {
    return (
      <div
        aria-label={`Foto de ${researcher.fullName}`}
        className={`${className} shrink-0 rounded-lg border border-slate-200 bg-cover bg-center bg-no-repeat shadow-sm`}
        style={{ backgroundImage: `url(${researcher.photoUrl})` }}
      />
    );
  }
  if (researcher.avatarInitials) {
    return (
      <div className={`${className} flex shrink-0 items-center justify-center rounded-lg bg-brand-pale font-bold text-brand`}>
        {researcher.avatarInitials}
      </div>
    );
  }
  return (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand`}>
      <UserRound size={40} />
    </div>
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
