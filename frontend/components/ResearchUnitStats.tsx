import { DirectorySummary } from "@/components/directories/DirectorySummary";
import type { getResearchUnitStats } from "@/lib/researchUnits";

export function ResearchUnitStats({ summary, ipressCount }: { summary: ReturnType<typeof getResearchUnitStats>; ipressCount: number }) {
  const number = (value: number) => value.toLocaleString("es-PE");
  return <DirectorySummary filtered items={[
    { label: "Unidades registradas", value: number(summary.totalUnits) },
    { label: "Redes con unidades", value: number(summary.networksWithUnits) },
    { label: "Unidades con CIEI en red o vinculado", value: number(summary.unitsWithCiei) },
    { label: "IPRESS distintas registradas", value: number(ipressCount) },
  ]} />;
}
