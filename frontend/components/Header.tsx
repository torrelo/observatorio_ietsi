import { BarChart3, Globe2, LogIn, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const nav = [
  ["Produccion cientifica", "/publicaciones"],
  ["Proyectos", "/proyectos"],
  ["Investigadores", "/investigadores"],
  ["Unidades", "/unidades"],
  ["Indicadores", "/indicadores"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/images/essalud_logo.png" alt="EsSalud" width={112} height={42} className="h-10 w-auto object-contain" />
            <Image src="/images/ietsi_logo.png" alt="IETSI" width={118} height={42} className="h-10 w-auto object-contain" />
            <Image src="/images/observatorio_logo.svg" alt="Observatorio" width={154} height={44} className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <button className="inline-flex h-10 items-center gap-2 rounded border border-slate-200 bg-white px-3 font-semibold text-slate-600">
              <Globe2 size={16} /> ES
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded bg-brand-dark px-3 font-semibold text-white">
              <LogIn size={16} /> Login institucional
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex gap-1 overflow-x-auto text-sm font-semibold text-slate-600">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded px-3 py-2 hover:bg-brand-pale hover:text-brand-dark">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex min-w-0 items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 lg:w-80">
            <Search size={16} className="text-brand" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Buscar publicaciones, proyectos, expertos..." />
          </div>
        </div>
      </div>
    </header>
  );
}
