export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-brand-sky">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}
