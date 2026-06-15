import { UserRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import type { Researcher } from "@/lib/types";

export function ResearcherCard({ researcher }: { researcher: Researcher }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand">
          <UserRound size={34} />
        </div>
        <div>
          <Link href={`/investigadores/${researcher.id}`} className="text-lg font-bold text-slate-950 hover:text-brand">{researcher.name}</Link>
          <p className="mt-1 text-sm text-slate-600">{researcher.specialty}</p>
          <p className="mt-1 text-sm font-medium text-brand-dark">{researcher.affiliation}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {researcher.renacyt ? <Badge>{researcher.renacyt}</Badge> : null}
        <Badge tone="sky">H-index {researcher.h_index}</Badge>
        <Badge tone="green">{researcher.publications} publicaciones</Badge>
      </div>
    </article>
  );
}
