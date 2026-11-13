import Link from "next/link";
import { notFound } from "next/navigation";
import { EthicsCommitteeDetail } from "@/components/EthicsCommitteeDetail";
import { SectionHeader } from "@/components/SectionHeader";
import { displayResearchUnitValue, getEthicsCommitteeById, getUnitsByNetwork } from "@/lib/researchUnits";

export default async function CieiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ciei = getEthicsCommitteeById(id);
  if (!ciei) notFound();
  const relatedUnits = ciei.network ? getUnitsByNetwork(ciei.network) : [];

  return (
    <div className="bg-brand-bg">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link className="text-brand hover:text-brand-dark" href="/">Inicio</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/unidades">Unidades</Link>
            <span>/</span>
            <Link className="text-brand hover:text-brand-dark" href="/unidades/ciei">CIEI</Link>
            <span>/</span>
            <span>Comité</span>
          </nav>
          <Link className="text-sm font-semibold text-brand" href="/unidades/ciei">← Volver a CIEI</Link>
          <SectionHeader eyebrow={ciei.ciei_id} title={ciei.ciei_name} description={`${displayResearchUnitValue(ciei.network)} · ${displayResearchUnitValue(ciei.region)}`} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[1fr_340px] lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Ficha CIEI</h2>
          <EthicsCommitteeDetail ciei={ciei} />
        </section>
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Unidades relacionadas por red</h2>
          <div className="space-y-3">
            {relatedUnits.map((unit) => (
              <Link key={unit.unit_id} className="block rounded border border-slate-200 bg-white p-3 hover:border-brand/30" href={`/unidades/${encodeURIComponent(unit.unit_id)}`}>
                <p className="font-bold text-slate-900">{unit.unit_name}</p>
                <p className="mt-1 text-sm text-slate-500">{unit.rci_code ?? unit.unit_id} · {displayResearchUnitValue(unit.ipress)}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
