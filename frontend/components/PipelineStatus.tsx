const stages = ["Formulacion", "Aprobacion etica", "Ejecucion", "Analisis", "Publicacion"];

export function PipelineStatus({ current }: { current: string }) {
  const activeIndex = stages.findIndex((stage) => stage.toLowerCase() === current.toLowerCase());
  return (
    <div className="grid gap-2 md:grid-cols-5">
      {stages.map((stage, index) => (
        <div key={stage} className={`rounded border px-3 py-3 text-center text-xs font-bold ${index <= activeIndex ? "border-brand bg-brand-pale text-brand-dark" : "border-slate-200 bg-white text-slate-400"}`}>
          {stage}
        </div>
      ))}
    </div>
  );
}
