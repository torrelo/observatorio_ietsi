import { BarChart3, BookOpen, FlaskConical, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard } from "@/components/KpiCard";
import { MapPanel } from "@/components/MapPanel";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function HomePage() {
  const summary = await api.home();
  const quickAccess: [string, LucideIcon][] = [
    ["Produccion", BookOpen],
    ["Proyectos", FlaskConical],
    ["Expertos", UsersRound],
    ["Indicadores", BarChart3],
  ];
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-sky">Inteligencia cientifica nacional</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Monitoreando la investigación e innovación en salud de EsSalud
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Plataforma institucional para produccion cientifica, gestion de proyectos, capacidades investigadoras y transparencia.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/publicaciones">Ver publicaciones</Button>
              <Button href="/investigadores" variant="secondary">Buscar investigadores</Button>
              <Button href="/proyectos" variant="secondary">Explorar proyectos</Button>
              <Button href="/indicadores">Dashboard nacional</Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-brand-pale p-6 shadow-panel">
            <div className="grid grid-cols-2 gap-3">
              {quickAccess.map(([label, Icon]) => (
                <div key={label} className="rounded bg-white p-5">
                  <Icon className="text-brand" size={28} />
                  <p className="mt-4 text-sm font-bold text-slate-800">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summary.kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-2 lg:px-8">
        <ChartCard title="Tendencias de investigacion" data={summary.trends} />
        <MapPanel regions={summary.map_regions} />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <SectionHeader title="Noticias y convocatorias" description="Actividad institucional reciente para la comunidad investigadora." />
        <div className="grid gap-4 md:grid-cols-3">
          {summary.news.map((item) => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-sky">{item.type}</p>
              <h3 className="mt-2 font-bold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-500">{item.date}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
