import type { ProjectPipelineStage } from "@/lib/projects";

const stages: ProjectPipelineStage[] = ["Formulación", "Evaluación ética", "Ejecución", "Análisis", "Publicación"];

export function ProjectPipeline({ current, compact = false }: { current: ProjectPipelineStage; compact?: boolean }) {
  const activeIndex = stages.findIndex((stage) => stage === current);
  return (
    <div className={compact ? "grid grid-cols-5 gap-1" : "grid gap-2 md:grid-cols-5"}>
      {stages.map((stage, index) => (
        <div
          key={stage}
          className={`rounded border text-center font-bold ${compact ? "px-2 py-2 text-[10px]" : "px-3 py-3 text-xs"} ${index <= activeIndex ? "border-brand bg-brand-pale text-brand-dark" : "border-slate-200 bg-white text-slate-400"}`}
        >
          {compact ? shortStage(stage) : stage}
        </div>
      ))}
    </div>
  );
}

function shortStage(stage: ProjectPipelineStage) {
  const labels: Record<ProjectPipelineStage, string> = {
    Formulación: "Form.",
    "Evaluación ética": "Ética",
    Ejecución: "Ejec.",
    Análisis: "Anál.",
    Publicación: "Pub.",
  };
  return labels[stage];
}
