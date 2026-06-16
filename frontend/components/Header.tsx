import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const nav = [
  ["Inicio", "/"],
  ["Produccion cientifica", "/publicaciones"],
  ["Investigadores", "/investigadores"],
  ["Proyectos", "/proyectos"],
  ["Unidades de investigacion", "/unidades"],
  ["Mas modulos", "/#modulos"],
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
            <button className="inline-flex h-10 items-center gap-2 rounded bg-brand-dark px-3 font-semibold text-white">
              <LogIn size={16} /> Login institucional
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <nav className="flex w-full gap-1 overflow-x-auto text-sm font-semibold text-slate-600">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded px-3 py-2 hover:bg-brand-pale hover:text-brand-dark">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
