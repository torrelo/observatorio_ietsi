import { FilterSidebar } from "@/components/FilterSidebar";
import { ResearcherCard } from "@/components/ResearcherCard";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function ResearchersPage() {
  const researchers = await api.researchers();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <SectionHeader title="Directorio de investigadores" description="Buscador de expertos por especialidad, afiliacion, lineas, metodologias y produccion cientifica." />
      <SearchBar placeholder="Buscar expertos por nombre, especialidad, linea de investigacion o palabra clave" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar groups={[
          { title: "Especialidad", options: ["Endocrinologia", "Infectologia", "Gestion sanitaria"] },
          { title: "Unidad", options: ["Rebagliati", "Almenara", "Arequipa"] },
          { title: "Grado academico", options: ["Doctorado", "Maestria", "Especialidad"] },
          { title: "RENACYT", options: ["Nivel II", "Nivel III", "Nivel IV"] },
        ]} />
        <div className="grid gap-4 md:grid-cols-2">{researchers.map((researcher) => <ResearcherCard key={researcher.id} researcher={researcher} />)}</div>
      </div>
    </section>
  );
}
