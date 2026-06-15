import { FilterSidebar } from "@/components/FilterSidebar";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function ProjectsPage() {
  const projects = await api.projects();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <SectionHeader title="Directorio de proyectos" description="Seguimiento del ciclo de vida de proyectos, estado etico, financiamiento, productos y resultados." />
      <SearchBar placeholder="Buscar por codigo, titulo, investigador principal, unidad o linea tematica" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar groups={[
          { title: "Estado", options: ["Formulacion", "Aprobacion etica", "En ejecucion", "Analisis", "Publicado"] },
          { title: "Tipo", options: ["Clinico", "Implementacion", "Servicios de salud"] },
          { title: "Financiamiento", options: ["IETSI", "Cooperacion", "Recursos ordinarios"] },
          { title: "Anio", options: ["2026", "2025", "2024"] },
        ]} />
        <div className="grid gap-4">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
      </div>
    </section>
  );
}
