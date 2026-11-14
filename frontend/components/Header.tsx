"use client";

import { LogIn, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const nav = [
  ["Inicio", "/"],
  ["Producción científica", "/produccion-cientifica"],
  ["Investigadores", "/investigadores"],
  ["Proyectos", "/proyectos"],
  ["Unidades de investigación", "/unidades"],
  ["Más módulos", "/#modulos"],
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const loginDialog = useRef<HTMLDialogElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const updateOffset = () => document.documentElement.style.setProperty("--header-offset", getComputedStyle(element).position === "sticky" ? `${element.getBoundingClientRect().height + 16}px` : "0px");
    const observer = new ResizeObserver(updateOffset);
    observer.observe(element);
    window.addEventListener("resize", updateOffset);
    updateOffset();
    return () => { observer.disconnect(); window.removeEventListener("resize", updateOffset); document.documentElement.style.removeProperty("--header-offset"); };
  }, []);

  useEffect(() => {
    if (!loginOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    loginDialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; };
  }, [loginOpen]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    }
    function onPointer(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    }
    function onFocus(event: FocusEvent) {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  return (
    <header ref={header} className="relative z-40 border-b border-slate-200 bg-white xl:sticky xl:top-0">
      <div className="site-container flex flex-col gap-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Observatorio Nacional de Investigación de EsSalud: Inicio" className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <Image src="/images/essalud_logo.png" alt="EsSalud" width={112} height={42} className="h-8 w-auto object-contain sm:h-10" />
              <Image src="/images/ietsi_logo.png" alt="IETSI" width={118} height={42} className="h-8 w-auto object-contain sm:h-10" />
              <Image src="/images/observatorio_logo.svg" alt="Observatorio" width={154} height={44} className="h-8 w-auto object-contain sm:h-10" />
            </div>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-5 text-brand-dark">Observatorio Nacional de Investigación de EsSalud</p>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" aria-haspopup="dialog" aria-controls="institutional-access" onClick={() => { setOpen(false); setLoginOpen(true); }} className="action-control gap-2 rounded bg-brand-dark px-4 text-sm font-semibold text-white hover:bg-brand">
              <LogIn size={18} aria-hidden="true" /> Login institucional
            </button>
            <button ref={toggle} type="button" aria-controls="navegacion-principal" aria-expanded={open} onClick={() => setOpen(value => !value)} className="action-control gap-2 rounded border border-slate-300 px-3 text-sm font-semibold text-brand-dark xl:hidden">
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />} Menú
            </button>
          </div>
        </div>
        <nav id="navegacion-principal" aria-label="Navegación principal" className={`${open ? "flex" : "hidden"} min-w-0 flex-col gap-1 text-base font-semibold text-slate-600 xl:flex xl:flex-row xl:flex-wrap`}>
          {nav.map(([label, href]) => {
            const active = !href.includes("#") && (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center rounded border-l-4 px-3 py-2 transition hover:bg-brand-pale hover:text-brand-dark xl:border-b-2 xl:border-l-0 ${active ? "border-brand bg-brand-pale text-brand-dark" : "border-transparent"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <dialog ref={loginDialog} id="institutional-access" aria-labelledby="institutional-access-title" aria-describedby="institutional-access-description" onClose={() => setLoginOpen(false)} className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 text-slate-900 shadow-panel backdrop:bg-slate-950/50">
        <h2 id="institutional-access-title" className="text-xl font-bold">Acceso institucional</h2>
        <p id="institutional-access-description" className="mt-3 leading-relaxed text-slate-600">El acceso institucional es simulado en este MVP. La autenticación todavía no está habilitada; no se solicitan ni se envían credenciales.</p>
        <form method="dialog" className="mt-5"><button className="action-control rounded bg-brand px-4 font-semibold text-white" type="submit">Cerrar</button></form>
      </dialog>
    </header>
  );
}
