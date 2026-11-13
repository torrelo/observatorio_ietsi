"use client";

import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Badge } from "@/components/Badge";
import type { ExpertiseTerm, ResearcherExpertise as ResearcherExpertiseData } from "@/lib/researcherExpertise";

type TabKey = "lines" | "topics" | "methods" | "keywords";

type TabDefinition = {
  key: TabKey;
  label: string;
  count: number;
};

export function ResearcherExpertise({ expertise }: { expertise: ResearcherExpertiseData }) {
  const baseId = useId();
  const tabs = useMemo(() => buildTabs(expertise), [expertise]);
  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0]?.key ?? "lines");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const active = tabs.some((tab) => tab.key === activeTab) ? activeTab : tabs[0]?.key ?? "lines";
  const summary = expertise.lines.slice(0, 3);
  const extraLines = Math.max(0, expertise.lines.length - summary.length);

  function toggle(key: string) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === active);
    if (index < 0) return;
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    setActiveTab(next.key);
    window.requestAnimationFrame(() => document.getElementById(`${baseId}-${next.key}-tab`)?.focus());
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-950">Áreas de experiencia científica</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Principales campos, temas y metodologías identificados en la producción científica del investigador.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Principales campos identificados</p>
          {extraLines > 0 ? (
            <button
              className="min-h-11 rounded px-1 text-sm font-semibold text-brand outline-none hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand/50"
              onClick={() => {
                setActiveTab("lines");
                setExpanded((current) => ({ ...current, lines: true }));
              }}
              type="button"
            >
              Ver todas las líneas ({expertise.lines.length})
            </button>
          ) : null}
        </div>
        {summary.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {summary.map((item, index) => <FeaturedField key={`${item.label}-${index}`} item={item} />)}
          </div>
        ) : (
          <EmptyState message="No se dispone de líneas temáticas clasificadas para este investigador." />
        )}
      </div>

      {tabs.length ? (
        <>
          <div
            aria-label="Grupos de experiencia científica"
            className="mt-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-0.5"
            onKeyDown={onTabKeyDown}
            role="tablist"
          >
            {tabs.map((tab) => {
              const selected = tab.key === active;
              return (
                <button
                  aria-controls={`${baseId}-${tab.key}-panel`}
                  aria-selected={selected}
                  className={`min-h-11 shrink-0 rounded-t px-3 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-brand/50 ${
                    selected
                      ? "border-b-2 border-brand bg-brand-pale text-brand-dark"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-dark"
                  }`}
                  id={`${baseId}-${tab.key}-tab`}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                >
                  {tab.label} · {tab.count}
                </button>
              );
            })}
          </div>

          <div className="pt-4">
            <TabPanel active={active === "lines"} baseId={baseId} tabKey="lines">
              <ExpandableTermList
                expanded={Boolean(expanded.lines)}
                initialCount={6}
                items={expertise.lines}
                onToggle={() => toggle("lines")}
                variant="chips"
              />
            </TabPanel>
            <TabPanel active={active === "topics"} baseId={baseId} tabKey="topics">
              <div className="space-y-5">
                <TermSection
                  expanded={Boolean(expanded.areas)}
                  initialCount={6}
                  items={expertise.areas}
                  onToggle={() => toggle("areas")}
                  title="Áreas temáticas"
                  variant="mixed"
                />
                <TermSection
                  expanded={Boolean(expanded.subthemes)}
                  initialCount={6}
                  items={expertise.subthemes}
                  onToggle={() => toggle("subthemes")}
                  title="Subtemas"
                  variant="rows"
                />
              </div>
            </TabPanel>
            <TabPanel active={active === "methods"} baseId={baseId} tabKey="methods">
              <ExpandableTermList
                emptyMessage="No se dispone de metodologías clasificadas para este investigador."
                expanded={Boolean(expanded.methods)}
                initialCount={8}
                items={expertise.methodologies}
                onToggle={() => toggle("methods")}
                variant="chips"
              />
            </TabPanel>
            <TabPanel active={active === "keywords"} baseId={baseId} tabKey="keywords">
              <ExpandableTermList
                expanded={Boolean(expanded.keywords)}
                initialCount={8}
                items={expertise.keywords}
                onToggle={() => toggle("keywords")}
                variant="chips"
              />
            </TabPanel>
          </div>
        </>
      ) : null}
    </section>
  );
}

function buildTabs(expertise: ResearcherExpertiseData): TabDefinition[] {
  const tabs: TabDefinition[] = [
    { key: "lines", label: "Líneas", count: expertise.lines.length },
    { key: "topics", label: "Temas y subtemas", count: expertise.areas.length + expertise.subthemes.length },
    { key: "methods", label: "Metodologías", count: expertise.methodologies.length },
    { key: "keywords", label: "Palabras clave", count: expertise.keywords.length },
  ];
  return tabs.filter((tab) => tab.count > 0);
}

function FeaturedField({ item }: { item: ExpertiseTerm }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-sm font-bold leading-5 text-brand-dark">{item.label}</p>
      {typeof item.count === "number" ? <p className="mt-2 text-xs font-semibold text-slate-500">{item.count} publicaciones</p> : null}
    </div>
  );
}

function TabPanel({ active, baseId, children, tabKey }: { active: boolean; baseId: string; children: ReactNode; tabKey: TabKey }) {
  if (!active) return null;
  return (
    <div aria-labelledby={`${baseId}-${tabKey}-tab`} id={`${baseId}-${tabKey}-panel`} role="tabpanel" tabIndex={0}>
      {children}
    </div>
  );
}

function TermSection(props: {
  expanded: boolean;
  initialCount: number;
  items: ExpertiseTerm[];
  onToggle: () => void;
  title: string;
  variant: "chips" | "rows" | "mixed";
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{props.title}</h3>
      <ExpandableTermList {...props} />
    </div>
  );
}

function ExpandableTermList({
  emptyMessage = "No se dispone de información clasificada para este investigador.",
  expanded,
  initialCount,
  items,
  onToggle,
  variant,
}: {
  emptyMessage?: string;
  expanded: boolean;
  initialCount: number;
  items: ExpertiseTerm[];
  onToggle: () => void;
  variant: "chips" | "rows" | "mixed";
}) {
  if (!items.length) return <EmptyState message={emptyMessage} />;
  const visible = expanded ? items : items.slice(0, initialCount);
  const canExpand = items.length > initialCount;
  return (
    <div>
      {variant === "rows" ? (
        <div className="space-y-2">
          {visible.map((item, index) => <TermRow key={`${item.label}-${index}`} item={item} />)}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((item, index) => (
            item.label.length > 70 && variant === "mixed" ? <TermRow key={`${item.label}-${index}`} item={item} /> : <TermChip key={`${item.label}-${index}`} item={item} />
          ))}
        </div>
      )}
      {canExpand ? (
        <button
          className="mt-3 min-h-11 rounded px-1 text-sm font-semibold text-brand outline-none hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand/50"
          onClick={onToggle}
          type="button"
        >
          {expanded ? "Ver menos" : `Ver todos (${items.length})`}
        </button>
      ) : null}
    </div>
  );
}

function TermChip({ item }: { item: ExpertiseTerm }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold leading-5 text-slate-700">
      <span className="whitespace-normal break-words">{item.label}</span>
      {typeof item.count === "number" ? <Badge tone="sky">{item.count}</Badge> : null}
    </span>
  );
}

function TermRow({ item }: { item: ExpertiseTerm }) {
  return (
    <div className="flex w-full min-w-0 items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="min-w-0 text-sm font-semibold leading-6 text-slate-700">{item.label}</p>
      {typeof item.count === "number" ? <span className="shrink-0 text-xs font-bold text-brand-dark">{item.count}</span> : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{message}</p>;
}
