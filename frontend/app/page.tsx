import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Building2,
  ClipboardCheck,
  Database,
  FlaskConical,
  HandCoins,
  Network,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { getHomeSummary } from "@/lib/home";
import { HomeSearch } from "@/components/HomeSearch";
import { RefreshSources } from "@/components/RefreshSources";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const summary = await getHomeSummary();
  const directories: { title: string; description: string; count: string; href: string; icon: LucideIcon }[] = [
    {
      title: "Produccion cientifica",
      description: "Publicaciones, revistas, DOI, PMID, citas y acceso abierto.",
      count: summary.directories.publications === null ? "Datos no disponibles" : `${summary.directories.publications} publicaciones`,
      href: "/produccion-cientifica",
      icon: BookOpen,
    },
    {
      title: "Investigadores",
      description: "Expertos, ORCID, RENACYT, filiaciones y lineas de investigacion.",
      count: summary.directories.researchers === null ? "Datos no disponibles" : `${summary.directories.researchers} investigadores`,
      href: "/investigadores",
      icon: UsersRound,
    },
    {
      title: "Proyectos",
      description: "Portafolio institucional, etapas, financiamiento y productos.",
      count: summary.directories.projects === null ? "Datos no disponibles" : `${summary.directories.projects} proyectos`,
      href: "/proyectos",
      icon: FlaskConical,
    },
    {
      title: "Unidades de investigacion",
      description: "Capacidades por red asistencial, region e infraestructura.",
      count: summary.directories.units === null ? "Datos no disponibles" : `${summary.directories.units} unidades`,
      href: "/unidades",
      icon: Building2,
    },
  ];
  const modules: { title: string; description: string; href: string; icon: LucideIcon }[] = [
    { title: "Indicadores y dashboards", description: "Analitica ejecutiva y seguimiento nacional.", href: "/indicadores", icon: BarChart3 },
    { title: "Convocatorias y financiamiento", description: "Fondos, oportunidades y bases institucionales.", href: "#noticias", icon: HandCoins },
    { title: "Redes y colaboracion", description: "Vinculos cientificos nacionales e internacionales.", href: "/investigadores", icon: Network },
    { title: "Ensayos clinicos", description: "Estudios activos, sedes y comites de etica.", href: "/proyectos", icon: ClipboardCheck },
    { title: "Repositorio institucional", description: "Produccion preservada y documentos de investigacion.", href: "#", icon: Database },
    { title: "Analitica avanzada", description: "Bibliometria, grafos, tendencias y mapas especializados.", href: "/indicadores", icon: BrainCircuit },
    { title: "Datos abiertos", description: "Conjuntos reutilizables, API y transparencia.", href: "#", icon: Database },
  ];
  const kpis = summary.kpis;
  const news = [
    { title: "Convocatorias CONCYTEC para investigacion aplicada", type: "CONCYTEC", date: "2026-06-10" },
    { title: "PROCIENCIA abre financiamiento para proyectos multicentricos", type: "PROCIENCIA", date: "2026-06-04" },
    { title: "OPS publica prioridades regionales de investigacion en salud", type: "OPS", date: "2026-05-28" },
    { title: "Convocatorias EsSalud para innovacion y evidencia institucional", type: "EsSalud", date: "2026-05-21" },
  ];

  return (
    <div className="bg-brand-bg">
      <section className="relative overflow-hidden bg-brand-dark">
        <Image src="/images/home-hero-science.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-brand-dark/[0.78]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-brand/55" />
        <div className="site-container relative py-12 lg:py-16">
          <div className="max-w-4xl">
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
              Observatorio Nacional de Investigación de EsSalud
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-brand-pale md:text-lg">
              Plataforma institucional para la gestión, visualización y análisis de la investigación e innovación en salud.
            </p>
            <HomeSearch />
          </div>
        </div>
      </section>

      {summary.unavailableSources.length ? <section className="site-container py-4" aria-label="Estado de las fuentes"><p role="status" className="text-sm text-slate-700">No se pudieron consultar estas fuentes: {summary.unavailableSources.join(", ")}. Los demás datos y accesos siguen disponibles.</p><RefreshSources /></section> : null}

      <section className="site-container section-spacing">
        <SectionHeader title="Directorios principales" description="Acceso directo a las fuentes centrales del ecosistema de investigacion institucional." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {directories.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-panel">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-pale text-brand">
                <item.icon size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-brand">{item.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-4 text-sm font-bold text-brand-dark">{item.count}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="modulos" className="site-container py-4">
        <SectionHeader title="Modulos complementarios" description="Rutas especializadas para explorar gestion, financiamiento, colaboracion y analitica avanzada." />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((item) => {
            const content = <>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-50 text-brand">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
                </div>
              </div>
            </>;
            const className = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm";
            return item.href === "#" ? <div key={item.title} className={className}>{content}<p className="mt-3 text-sm font-semibold text-slate-600">Próximamente</p></div> : <Link key={item.title} href={item.href} className={`${className} transition hover:border-brand/30`}>{content}</Link>;
          })}
        </div>
      </section>

      <section className="site-container section-spacing">
        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="noticias" className="site-container py-4">
        <SectionHeader title="Noticias y convocatorias" description="Oportunidades y novedades relevantes para la comunidad investigadora." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {news.map((item) => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-brand-ink">{item.type}</p>
              <h3 className="mt-2 font-bold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-500">{item.date}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
