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
  Search,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function HomePage() {
  const summary = await api.home();
  const directories: { title: string; description: string; count: string; href: string; icon: LucideIcon }[] = [
    {
      title: "Produccion cientifica",
      description: "Publicaciones, revistas, DOI, PMID, citas y acceso abierto.",
      count: "12,458 publicaciones",
      href: "/publicaciones",
      icon: BookOpen,
    },
    {
      title: "Investigadores",
      description: "Expertos, ORCID, RENACYT, filiaciones y lineas de investigacion.",
      count: "2,145 investigadores",
      href: "/investigadores",
      icon: UsersRound,
    },
    {
      title: "Proyectos",
      description: "Portafolio institucional, etapas, financiamiento y productos.",
      count: "684 proyectos",
      href: "/proyectos",
      icon: FlaskConical,
    },
    {
      title: "Unidades de investigacion",
      description: "Capacidades por red asistencial, region e infraestructura.",
      count: "58 unidades",
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
  const kpiLabels: Record<string, string> = {
    "Publicaciones indexadas": "Publicaciones indexadas",
    "Investigadores registrados": "Investigadores registrados",
    "Proyectos activos": "Proyectos activos",
    "Unidades de investigacion": "Unidades de investigacion",
    "Ensayos clinicos": "Ensayos clinicos activos",
    "Financiamiento captado": "Financiamiento captado",
  };
  const kpis = summary.kpis.filter((kpi) => Object.keys(kpiLabels).includes(kpi.label));
  const news = [
    { title: "Convocatorias CONCYTEC para investigacion aplicada", type: "CONCYTEC", date: "2026-06-10" },
    { title: "PROCIENCIA abre financiamiento para proyectos multicentricos", type: "PROCIENCIA", date: "2026-06-04" },
    { title: "OPS publica prioridades regionales de investigacion en salud", type: "OPS", date: "2026-05-28" },
    { title: "Convocatorias EsSalud para innovacion y evidencia institucional", type: "EsSalud", date: "2026-05-21" },
  ];

  return (
    <div className="bg-brand-bg">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-9">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-950 md:text-5xl">
              Observatorio Nacional de Investigación de EsSalud
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Plataforma institucional para la gestión, visualización y análisis de la investigación e innovación en salud.
            </p>
            <form className="mt-7 flex min-h-16 w-full max-w-3xl items-center gap-3 rounded-lg border-2 border-brand/20 bg-white px-4 shadow-panel ring-4 ring-brand-pale/70">
              <Search size={24} className="shrink-0 text-brand" />
              <input
                className="w-full bg-transparent text-base font-medium text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Buscar publicaciones, investigadores, proyectos, unidades y más..."
              />
              <button className="inline-flex rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark" type="submit">
                Buscar
              </button>
            </form>
          </div>
          <div className="relative min-h-52 overflow-hidden rounded-lg border border-slate-200 shadow-panel">
            <Image src="/images/home-hero-science.png" alt="Investigacion cientifica institucional" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/15 to-transparent" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <SectionHeader title="Directorios principales" description="Acceso directo a las fuentes centrales del ecosistema de investigacion institucional." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {directories.map((item) => (
            <Link key={item.title} href={item.href} className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-panel">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-pale text-brand">
                <item.icon size={24} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-brand">{item.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.description}</p>
              <p className="mt-4 text-sm font-bold text-brand-dark">{item.count}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="modulos" className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        <SectionHeader title="Modulos complementarios" description="Rutas especializadas para explorar gestion, financiamiento, colaboracion y analitica avanzada." />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((item) => (
            <Link key={item.title} href={item.href} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand/30">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-50 text-brand">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-7 lg:px-8">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{kpiLabels[kpi.label]}</p>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{kpi.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="noticias" className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        <SectionHeader title="Noticias y convocatorias" description="Oportunidades y novedades relevantes para la comunidad investigadora." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {news.map((item) => (
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
