import type { ReactNode } from "react";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PublicationCard } from "@/components/PublicationCard";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";

export default async function PublicationsPage() {
  const publications = await api.publications();
  return (
    <DirectoryShell
      title="Directorio de produccion cientifica"
      description="Publicaciones indexadas con metadatos bibliometricos, filiacion institucional y trazabilidad DOI/PMID."
      filters={[
        { title: "Autor", options: ["Mariana Torres", "Jorge Salazar", "Rosa Medina"] },
        { title: "Hospital o red", options: ["Rebagliati", "Almenara", "Arequipa"] },
        { title: "Anio", options: ["2026", "2025", "2024", "2023"] },
        { title: "Cuartil", options: ["Q1", "Q2", "Q3"] },
        { title: "Tipo de estudio", options: ["Cohorte", "Ensayo pragmatico", "Vigilancia"] },
      ]}
    >
      {publications.map((publication) => <PublicationCard key={publication.id} publication={publication} />)}
    </DirectoryShell>
  );
}

function DirectoryShell({ title, description, filters, children }: { title: string; description: string; filters: { title: string; options: string[] }[]; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <SectionHeader title={title} description={description} />
      <SearchBar placeholder="Buscar por titulo, autor, revista, DOI, PMID o palabras clave" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar groups={filters} />
        <div className="grid gap-4">{children}</div>
      </div>
    </section>
  );
}
