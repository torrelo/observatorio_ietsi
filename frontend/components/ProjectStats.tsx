import { DirectorySummary } from "@/components/directories/DirectorySummary";
import type { getProjectStats } from "@/lib/projects";

export function ProjectStats({ summary }: { summary: ReturnType<typeof getProjectStats> }) {
  const number = (value: number) => value.toLocaleString("es-PE");
  return <DirectorySummary filtered items={[
    { label: "Proyectos registrados", value: number(summary.totalProjects) },
    { label: "Proyectos activos", value: number(summary.active) },
    { label: "Proyectos de innovación", value: number(summary.innovation) },
    { label: "Con investigador principal", value: number(summary.withPrincipal) },
  ]} />;
}
