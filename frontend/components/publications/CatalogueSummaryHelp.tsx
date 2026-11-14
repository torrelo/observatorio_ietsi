"use client";

import { Info } from "lucide-react";
import { useId, useRef, useState } from "react";

export function CatalogueSummaryHelp() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);

  return (
    <div className="mb-3" onKeyDown={event => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    }}>
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-600">Resumen del catálogo</h2>
        <button ref={button} type="button" aria-label="Ayuda sobre el resumen del catálogo" aria-controls={id} aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-brand hover:bg-brand-pale">
          <Info size={18} aria-hidden="true" />
        </button>
      </div>
      <p id={id} hidden={!open} className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Estos indicadores resumen todo el catálogo. Los filtros se aplican al listado de publicaciones.</p>
    </div>
  );
}
