import { FilterSidebar } from "@/components/FilterSidebar";
import { MapPanel } from "@/components/MapPanel";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { UnitCard } from "@/components/UnitCard";
import { api } from "@/lib/api";

export default async function UnitsPage() {
  const [units, summary] = await Promise.all([api.units(), api.home()]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <SectionHeader title="Directorio de unidades de investigacion" description="Capacidades regionales, productividad, infraestructura, redes de colaboracion y ranking interno." />
      <SearchBar placeholder="Buscar por unidad, red asistencial, region o linea de investigacion" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar groups={[
          { title: "Tipo de unidad", options: ["Unidad hospitalaria", "Centro especializado", "Nodo regional"] },
          { title: "Red asistencial", options: ["Rebagliati", "Almenara", "Arequipa"] },
          { title: "Region", options: ["Lima", "Arequipa", "La Libertad"] },
          { title: "Estado", options: ["Activa", "En fortalecimiento"] },
        ]} />
        <div className="space-y-6">
          <MapPanel regions={summary.map_regions} />
          <div className="grid gap-4 md:grid-cols-2">{units.map((unit) => <UnitCard key={unit.id} unit={unit} />)}</div>
        </div>
      </div>
    </section>
  );
}
