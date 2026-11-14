"use client";

import { Info } from "lucide-react";
import { useId, useRef, useState } from "react";
import { KpiCard } from "@/components/KpiCard";
import styles from "./Directory.module.css";

export function DirectorySummary({ items, filtered = false }: { items: { label: string; value: string }[]; filtered?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  return <section className={styles.summary} aria-label={filtered ? "Resumen de los resultados" : "Resumen del directorio"}>
    <div className="mb-3 flex items-center gap-2" onKeyDown={e => { if (e.key === "Escape" && open) { setOpen(false); button.current?.focus(); } }}>
      <h2 className="text-sm font-bold text-slate-700">{filtered ? "Resumen de los resultados" : "Resumen del directorio"}</h2>
      <button ref={button} type="button" aria-label="Ayuda sobre el resumen del directorio" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} className="action-control rounded text-brand"><Info size={18} aria-hidden="true" /></button>
    </div>
    <p id={id} hidden={!open} className="mb-4 max-w-3xl text-sm text-slate-600">{filtered ? "Estos indicadores resumen todas las coincidencias de la búsqueda y los filtros, no solo la página visible." : "Estos indicadores resumen todo el directorio. Los filtros se aplican al listado."}</p>
    <div className={styles.kpis}>{items.slice(0,4).map(item => <KpiCard key={item.label} variant="directory" kpi={item} />)}</div>
  </section>;
}
