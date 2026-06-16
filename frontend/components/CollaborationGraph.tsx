import type { CollaborationNode } from "@/lib/researchers";

export function CollaborationGraph({ center, nodes }: { center: string; nodes: CollaborationNode[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-950">Redes de colaboración</h2>
      <div className="relative min-h-72 overflow-hidden rounded border border-slate-100 bg-slate-50 p-5">
        <div className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-center text-xs font-bold text-white shadow">
          {center}
        </div>
        {nodes.map((node, index) => {
          const positions = [
            "left-[8%] top-[14%]",
            "right-[8%] top-[18%]",
            "left-[12%] bottom-[12%]",
            "right-[12%] bottom-[14%]",
            "left-[42%] top-[4%]",
            "left-[42%] bottom-[4%]",
          ];
          const size = Math.max(68, Math.min(112, node.weight + 28));
          return (
            <div key={`${node.kind}-${node.label}`} className={`absolute ${positions[index % positions.length]} rounded-full border border-brand/20 bg-white p-3 text-center shadow-sm`} style={{ width: size, height: size }}>
              <p className="text-[11px] font-bold leading-tight text-brand-dark">{node.label}</p>
              <p className="mt-1 text-[10px] text-slate-500">{node.kind}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
        {nodes.map((node) => (
          <div key={node.label} className="rounded border border-slate-100 bg-slate-50 p-3">
            <p className="font-semibold text-slate-900">{node.label}</p>
            <p className="text-xs text-slate-500">{node.kind} · intensidad {node.weight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
