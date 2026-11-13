export function SectionHeader({ eyebrow, title, description, as: Heading = "h2" }: { eyebrow?: string; title: string; description?: string; as?: "h1" | "h2" }) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="text-xs font-bold uppercase text-brand-ink">{eyebrow}</p> : null}
      <Heading className={`mt-1 font-bold text-slate-950 ${Heading === "h1" ? "page-heading" : "section-heading"}`}>{title}</Heading>
      {description ? <p className="section-description mt-3 text-slate-600">{description}</p> : null}
    </div>
  );
}
