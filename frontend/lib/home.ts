import { isDataSourceError } from "./sourceErrors";

// Keep independently available sources usable; never mask module or rendering failures.
export async function getHomeSummary() {
  const results = await Promise.allSettled([
    import("./publications").then(module => module.getPublicationsSummary()),
    import("./researchers").then(module => module.getResearcherSummary()),
    import("./projects").then(module => module.getProjectStats()),
    import("./researchUnits").then(module => module.getResearchUnitStats()),
  ]);
  const [publicationResult, researcherResult, projectResult, unitResult] = results;
  const publications = publicationResult.status === "fulfilled" ? publicationResult.value : null;
  const researchers = researcherResult.status === "fulfilled" ? researcherResult.value : null;
  const projects = projectResult.status === "fulfilled" ? projectResult.value : null;
  const units = unitResult.status === "fulfilled" ? unitResult.value : null;
  const sourceLabels = ["Producción científica", "Investigadores", "Proyectos", "Unidades"];
  const unavailableSources = results.flatMap((result,index) => {
    if (result.status === "fulfilled") return [];
    if (!isDataSourceError(result.reason)) throw result.reason;
    console.error(`No se pudo consultar la fuente de portada: ${sourceLabels[index]}`, result.reason);
    return [sourceLabels[index]];
  });
  const format = (value: number | undefined) => value === undefined ? null : value.toLocaleString("es-PE");
  const indicator = (value: number | undefined) => format(value) ?? "No disponible";
  return {
    unavailableSources,
    directories: {
      publications: format(publications?.total_publicaciones),
      researchers: format(researchers?.registered),
      projects: format(projects?.totalProjects),
      units: format(units?.totalUnits),
    },
    kpis: [
      { label: "Total publicaciones", value: indicator(publications?.total_publicaciones) },
      { label: "Investigadores registrados", value: indicator(researchers?.registered) },
      { label: "Proyectos activos", value: indicator(projects?.active) },
      { label: "Unidades de investigacion", value: indicator(units?.totalUnits) },
      { label: "Citas totales", value: indicator(publications?.citas_totales) },
      { label: "Publicaciones de acceso abierto", value: indicator(publications?.acceso_abierto) },
    ],
  };
}
