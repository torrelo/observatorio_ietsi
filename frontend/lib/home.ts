import { getPublicationsSummary } from "@/lib/publications";
import { getResearcherSummary } from "@/lib/researchers";
import { getProjectStats } from "@/lib/projects";
import { getResearchUnitStats } from "@/lib/researchUnits";

// Share the directory summaries rather than mixing local data with the legacy API.
export async function getHomeSummary() {
  const publications = await getPublicationsSummary();
  const researchers = getResearcherSummary();
  const projects = getProjectStats();
  const units = getResearchUnitStats();
  const format = (value: number) => value.toLocaleString("es-PE");

  return {
    directories: {
      publications: format(publications.total_publicaciones),
      researchers: format(researchers.registered),
      projects: format(projects.totalProjects),
      units: format(units.totalUnits),
    },
    kpis: [
      { label: "Total publicaciones", value: format(publications.total_publicaciones) },
      { label: "Investigadores registrados", value: format(researchers.registered) },
      { label: "Proyectos activos", value: format(projects.active) },
      { label: "Unidades de investigacion", value: format(units.totalUnits) },
      { label: "Citas totales", value: format(publications.citas_totales) },
      { label: "Publicaciones de acceso abierto", value: format(publications.acceso_abierto) },
    ],
  };
}
